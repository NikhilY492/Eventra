from django.contrib import admin
from .models import Event, Booking, Ticket

# Register the Event model with admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = ['title', 'event_type', 'venue', 'event_date', 
                   'event_time', 'available_seats', 'is_active']
    
    list_filter = ['event_type', 'event_date', 'is_active']
    
    search_fields = ['title', 'venue']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'event_type', 'venue', 'description')
        }),
        ('Schedule', {
            'fields': ('event_date', 'event_time')
        }),
        ('Tickets', {
            'fields': ('ticket_price', 'total_seats', 'available_seats')
        }),
        ('Status', {
            'fields': ('is_active',)
        })
    )

class TicketInline(admin.TabularInline):
    # This shows tickets INSIDE the booking form
    model = Ticket
    extra = 0  # Don't show extra empty forms
    readonly_fields = ['otp_code', 'is_verified', 'verified_at']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'event', 'number_of_tickets', 
                   'total_amount', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'event__event_type']
    search_fields = ['customer_name', 'roll_number', 'phone']
    
    # Make total_amount read-only since it's calculated automatically
    readonly_fields = ['total_amount', 'created_at']
    
    # Group fields logically
    fieldsets = (
        ('Event', {
            'fields': ('event',)
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'roll_number', 'section', 'email', 'phone')
        }),
        ('Booking Details', {
            'fields': ('number_of_tickets', 'total_amount', 'payment_status', 'payment_id')
        }),
    )
    
    inlines = [TicketInline]

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['booking', 'ticket_number', 'otp_code', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['otp_code', 'booking__customer_name']
    readonly_fields = ['otp_code']