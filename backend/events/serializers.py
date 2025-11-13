from rest_framework import serializers
from .models import Event, Booking, Ticket

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class EventListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'event_type', 'organizer', 'venue', 'ticket_price',
            'available_seats', 'event_date', 'event_time', 'location', 'is_active'
        ]

class BookingSerializer(serializers.ModelSerializer):
    # This converts booking data to/from JSON
    
    class Meta:
        model = Booking
        fields = ['id', 'event', 'customer_name', 'roll_number', 'section', 
                 'email', 'phone', 'number_of_tickets', 'total_amount', 
                 'payment_status', 'created_at']
        
        # These fields are calculated automatically, user can't set them
        read_only_fields = ['id', 'total_amount', 'payment_status', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_number', 'otp_code', 'is_verified']
        read_only_fields = ['id', 'otp_code', 'is_verified']

class BookingWithTicketsSerializer(serializers.ModelSerializer):
    # This shows booking details WITH all ticket OTP codes
    tickets = TicketSerializer(many=True, read_only=True)
    # many=True means "include ALL tickets for this booking"
    
    class Meta:
        model = Booking
        fields = ['id', 'event', 'customer_name', 'roll_number', 'section',
                 'email', 'phone', 'number_of_tickets', 'total_amount',
                 'payment_status', 'tickets', 'created_at']
        read_only_fields = ['id', 'total_amount', 'payment_status', 'created_at']