from django.urls import path
from .views import EventListCreateView, EventDetailView, create_booking, volunteer_verify_ticket, complete_payment # Added complete_payment
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    # Events
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Booking - Step 1: Create pending booking
    path('events/<int:event_id>/book/', create_booking, name='create-booking'),
    
    # Payment - Step 2: Complete payment and finalize booking
    path('bookings/<int:booking_id>/complete-payment/', complete_payment, name='complete-payment'),
    
    # Verification  
    path('verify-ticket/', volunteer_verify_ticket, name='verify-ticket'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)