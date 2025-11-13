from django.shortcuts import render
from .models import Event, Booking, Ticket
from django.core.mail import send_mail
from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import (EventSerializer, EventListSerializer, BookingSerializer, BookingWithTicketsSerializer, TicketSerializer)

import random 
import datetime 

# Create your views here.
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventListSerializer
        return EventSerializer
    
    def get_permissions(self):
        # TEMPORARILY allowing POST (Create Event) without authentication
        if self.request.method in ['GET', 'POST']:
            return [AllowAny()]
        # All other methods (PUT, DELETE) still require IsAuthenticated.
        return [IsAuthenticated()]
    
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        # 🚨 TEMPORARY FIX APPLIED HERE:
        # Allowing GET (View) and DELETE (Delete) without authentication for testing.
        if self.request.method in ['GET', 'DELETE']:
            return [AllowAny()]
        return [IsAuthenticated()] # PUT (Edit) still requires authentication

@api_view(['POST'])
@permission_classes([AllowAny])
def create_booking(request, event_id):
    """
    Step 1: Create a booking with PENDING status.
    The frontend calls this immediately after the registration form is validated.
    """
    event = get_object_or_404(Event, id=event_id)
    # Ensure tickets_requested is an integer, default to 1
    tickets_requested = int(request.data.get('number_of_tickets', 1))
    
    if event.available_seats < tickets_requested:
        return Response(
            {'error': 'Not enough seats available'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking_data = request.data.copy()
    booking_data['event'] = event.id
    # Ensure payment status is pending for the first step
    booking_data['payment_status'] = 'pending' 
    booking_data['number_of_tickets'] = tickets_requested
    
    serializer = BookingSerializer(data=booking_data)
    if serializer.is_valid():
        # Save the booking object (tickets are NOT created yet)
        booking = serializer.save() 
        
        # Return booking details without tickets for the next step (payment)
        response_data = BookingSerializer(booking).data 
        response_data['message'] = "Booking initiated. Proceed to payment."
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def complete_payment(request, booking_id):
    """
    Step 2: Mark payment as completed, reduce seats, generate tickets, and send email.
    The frontend calls this after the payment processing simulation.
    """
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.payment_status == 'completed':
        return Response({'error': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Update Payment Status & ID (using current time/booking ID for simulated ID)
    booking.payment_status = 'completed'
    booking.payment_id = request.data.get('payment_id', f'PAY-{booking_id}-{random.randint(1000, 9999)}')
    
    # 2. Update Available Seats on Event
    event = booking.event
    event.available_seats -= booking.number_of_tickets
    event.save()
    
    # 3. Create Tickets 
    if not booking.tickets.exists():
        for i in range(booking.number_of_tickets):
            Ticket.objects.create(
                booking=booking,
                ticket_number=i + 1
            )
            
    # Save the updated booking status
    booking.save() 

    # 4. Send Confirmation Email 
    if booking.email:
        send_mail(
            subject=f'Ticket Booking Confirmation for {event.title}',
            message=f'Your payment for {event.title} is complete. Booking ID: {booking.id}. Please check the app for your ticket OTPs.',
            from_email=None, 
            recipient_list=[booking.email],
            fail_silently=False,
        )

    # Return booking details with tickets for the success page
    response_serializer = BookingWithTicketsSerializer(booking)
    return Response(response_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_ticket(request):
    """
    Verify a ticket using OTP code
    URL: /api/verify-ticket/
    """
    otp_code = request.data.get('otp_code')
    
    if not otp_code:
        return Response({'error': 'OTP code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find ticket with this OTP
        ticket = Ticket.objects.get(otp_code=otp_code)
        
        # Check if already verified
        if ticket.is_verified:
            return Response({
                'error': 'Ticket already verified',
                'ticket_info': {
                    'customer': ticket.booking.customer_name,
                    'event': ticket.booking.event.title,
                    'verified_at': ticket.verified_at
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified
        ticket.is_verified = True
        ticket.save()
        
        return Response({
            'message': 'Ticket verified successfully!',
            'ticket_info': {
                'customer': ticket.booking.customer_name,
                'event': ticket.booking.event.title,
                'ticket_number': ticket.ticket_number
            }
        }, status=status.HTTP_200_OK)
        
    except Ticket.DoesNotExist:
        return Response({
            'error': 'Invalid OTP code'
        }, status=status.HTTP_404_NOT_FOUND)