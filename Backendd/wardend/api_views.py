# api_views.py

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Q
from django.db.models.functions import TruncDay, TruncMonth
from datetime import datetime, timedelta

from .models import Complaint, CustomUser, Hostel

def is_warden(user):
    return user.is_authenticated and user.user_type == 'warden'

@login_required
@user_passes_test(is_warden)
def complaint_statistics_api(request):
    """
    API endpoint to get complaint statistics for charts
    """
    # Get the hostel managed by this warden
    warden_hostel = Hostel.objects.get(warden=request.user)
    
    # Get all students in this hostel
    hostel_students = CustomUser.objects.filter(hostel=warden_hostel, user_type='student')
    
    # Set time period
    period = request.GET.get('period', 'week')
    
    if period == 'week':
        start_date = datetime.now() - timedelta(days=7)
        trunc_function = TruncDay
        date_format = '%a'  # Short day name
    elif period == 'month':
        start_date = datetime.now() - timedelta(days=30)
        trunc_function = TruncDay
        date_format = '%d %b'  # Day number + short month
    elif period == 'year':
        start_date = datetime.now() - timedelta(days=365)
        trunc_function = TruncMonth
        date_format = '%b'  # Short month name
    else:
        # Default to week
        start_date = datetime.now() - timedelta(days=7)
        trunc_function = TruncDay
        date_format = '%a'
    
    # Get all complaints in the period
    complaints = Complaint.objects.filter(
        student__in=hostel_students,
        created_at__gte=start_date
    )
    
    # Group by day/month
    complaints_by_date = complaints.annotate(
        date=trunc_function('created_at')
    ).values('date').annotate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='pending')),
        assigned=Count('id', filter=Q(status='assigned')),
        resolved=Count('id', filter=Q(status='resolved'))
    ).order_by('date')
    
    # Format for chart
    dates = []
    pending_data = []
    assigned_data = []
    resolved_data = []
    
    for item in complaints_by_date:
        dates.append(item['date'].strftime(date_format))
        pending_data.append(item['pending'])
        assigned_data.append(item['assigned'])
        resolved_data.append(item['resolved'])
    
    # Pie chart data for categories
    category_data = complaints.values('complaint_type__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    category_labels = [item['complaint_type__name'] for item in category_data]
    category_counts = [item['count'] for item in category_data]
    
    return JsonResponse({
        'timeline': {
            'labels': dates,
            'datasets': [
                {
                    'label': 'Pending',
                    'data': pending_data,
                    'backgroundColor': 'rgba(255, 193, 7, 0.5)',
                    'borderColor': 'rgba(255, 193, 7, 1)',
                },
                {
                    'label': 'Assigned',
                    'data': assigned_data,
                    'backgroundColor': 'rgba(13, 110, 253, 0.5)',
                    'borderColor': 'rgba(13, 110, 253, 1)',
                },
                {
                    'label': 'Resolved',
                    'data': resolved_data,
                    'backgroundColor': 'rgba(25, 135, 84, 0.5)',
                    'borderColor': 'rgba(25, 135, 84, 1)',
                }
            ]
        },
        'categories': {
            'labels': category_labels,
            'datasets': [{
                'data': category_counts,
                'backgroundColor': [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
                ]
            }]
        }
    })

@login_required
@user_passes_test(is_warden)
def hostel_statistics_api(request):
    """
    API endpoint to get hostel statistics
    """
    # Get the hostel managed by this warden
    warden_hostel = Hostel.objects.get(warden=request.user)
    
    # Get room occupancy statistics
    rooms = warden_hostel.rooms.all()
    total_rooms = rooms.count()
    occupied_rooms = sum(1 for room in rooms if room.occupants.count() > 0)
    full_rooms = sum(1 for room in rooms if room.is_full)
    
    # Calculate percentages
    occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
    capacity_utilization = (warden_hostel.current_occupancy / warden_hostel.capacity * 100) if warden_hostel.capacity > 0 else 0
    
    return JsonResponse({
        'hostel_name': warden_hostel.name,
        'total_capacity': warden_hostel.capacity,
        'current_occupancy': warden_hostel.current_occupancy,
        'available_space': warden_hostel.available_space,
        'occupancy_rate': round(occupancy_rate, 1),
        'total_rooms': total_rooms,
        'occupied_rooms': occupied_rooms,
        'full_rooms': full_rooms,
        'empty_rooms': total_rooms - occupied_rooms,
        'capacity_utilization': round(capacity_utilization, 1)
    })