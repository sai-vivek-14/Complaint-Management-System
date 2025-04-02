# views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Count, Q
from django.http import HttpResponse
import csv
from datetime import datetime, timedelta

from .models import Complaint, CustomUser, Hostel, ComplaintType, WorkerProfile

# Helper function to check if user is a warden
def is_warden(user):
    return user.is_authenticated and user.user_type == 'warden'

@login_required
@user_passes_test(is_warden)
def warden_dashboard(request):
    """
    Main dashboard view for wardens showing complaint statistics
    """
    # Get the hostel managed by this warden
    warden_hostel = get_object_or_404(Hostel, warden=request.user)
    
    # Get all students in this hostel
    hostel_students = CustomUser.objects.filter(hostel=warden_hostel, user_type='student')
    
    # Get complaints from students in this hostel
    current_week = datetime.now().isocalendar()[1]
    
    # Weekly complaints count
    all_complaints = Complaint.objects.filter(student__in=hostel_students)
    weekly_complaints = all_complaints.filter(
        created_at__gte=datetime.now() - timedelta(days=7)
    )
    
    # Complaints resolved this week
    resolved_this_week = weekly_complaints.filter(status='resolved')
    
    # Pending approval complaints
    pending_approval = all_complaints.filter(status='pending')
    
    # Category distribution
    category_distribution = all_complaints.values('complaint_type__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    context = {
        'hostel': warden_hostel,
        'total_complaints_weekly': weekly_complaints.count(),
        'resolved_this_week': resolved_this_week.count(),
        'pending_approval': pending_approval,
        'category_distribution': category_distribution,
    }
    
    return render(request, 'warden/dashboard.html', context)

@login_required
@user_passes_test(is_warden)
def complaint_list(request):
    """
    View for listing all complaints for the warden's hostel
    """
    # Get the hostel managed by this warden
    warden_hostel = get_object_or_404(Hostel, warden=request.user)
    
    # Get all students in this hostel
    hostel_students = CustomUser.objects.filter(hostel=warden_hostel, user_type='student')
    
    # Get filter parameters
    status_filter = request.GET.get('status', '')
    category_filter = request.GET.get('category', '')
    
    # Base queryset - all complaints from students in this hostel
    complaints = Complaint.objects.filter(student__in=hostel_students)
    
    # Apply filters if provided
    if status_filter:
        complaints = complaints.filter(status=status_filter)
    
    if category_filter:
        complaints = complaints.filter(complaint_type__name=category_filter)
    
    # Get all complaint types for the filter dropdown
    complaint_types = ComplaintType.objects.all()
    
    context = {
        'complaints': complaints,
        'complaint_types': complaint_types,
        'current_status': status_filter,
        'current_category': category_filter,
    }
    
    return render(request, 'warden/complaint_list.html', context)

@login_required
@user_passes_test(is_warden)
def complaint_detail(request, complaint_id):
    """
    View for showing and managing a specific complaint
    """
    # Get the hostel managed by this warden
    warden_hostel = get_object_or_404(Hostel, warden=request.user)
    
    # Get all students in this hostel
    hostel_students = CustomUser.objects.filter(hostel=warden_hostel, user_type='student')
    
    # Ensure the complaint belongs to a student in this warden's hostel
    complaint = get_object_or_404(Complaint, id=complaint_id, student__in=hostel_students)
    
    # Get available workers for this complaint type
    available_workers = CustomUser.objects.filter(
        user_type='worker',
        worker_profile__is_available=True,
        worker_profile__complaint_types=complaint.complaint_type
    )
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'approve':
            # Approve the complaint and change status to 'assigned'
            worker_id = request.POST.get('worker')
            if worker_id:
                worker = get_object_or_404(CustomUser, id=worker_id, user_type='worker')
                complaint.assigned_worker = worker
                complaint.status = 'assigned'
                complaint.save()
                messages.success(request, f'Complaint assigned to {worker}')
            else:
                messages.error(request, 'Please select a worker to assign')
        
        elif action == 'reject':
            # Reject the complaint
            complaint.status = 'resolved'  # Using 'resolved' to indicate it's closed without action
            complaint.save()
            messages.success(request, 'Complaint has been rejected')
        
        return redirect('warden_complaint_list')
    
    context = {
        'complaint': complaint,
        'available_workers': available_workers,
    }
    
    return render(request, 'warden/complaint_detail.html', context)

@login_required
@user_passes_test(is_warden)
def export_complaints_csv(request):
    """
    Export complaints data as CSV
    """
    # Get the hostel managed by this warden
    warden_hostel = get_object_or_404(Hostel, warden=request.user)
    
    # Get all students in this hostel
    hostel_students = CustomUser.objects.filter(hostel=warden_hostel, user_type='student')
    
    # Get all complaints from students in this hostel
    complaints = Complaint.objects.filter(student__in=hostel_students)
    
    # Create the HttpResponse object with CSV header
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="complaints.csv"'
    
    # Create the CSV writer and write header
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Student', 'Type', 'Description', 'Status', 
        'Assigned Worker', 'Created At', 'Room'
    ])
    
    # Write data rows
    for complaint in complaints:
        writer.writerow([
            complaint.id,
            str(complaint.student),
            complaint.complaint_type.name,
            complaint.description,
            complaint.get_status_display(),
            str(complaint.assigned_worker) if complaint.assigned_worker else 'Not Assigned',
            complaint.created_at.strftime('%Y-%m-%d %H:%M'),
            # Try to get the student's room if available
            complaint.student.student_profile.room.room_number if hasattr(complaint.student, 'student_profile') and complaint.student.student_profile.room else 'N/A'
        ])
    
    return response