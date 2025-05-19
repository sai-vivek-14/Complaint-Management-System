# views.py
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ssdash.models import Complaint
from datetime import datetime, timedelta

class DashboardStatsView(APIView):
    """API endpoint for hostel dashboard statistics"""
    
    def get(self, request):
        try:
            # Calculate time period for semester (example: last 6 months)
            semester_start = datetime.now() - timedelta(days=180)
            
            # Get total complaints in current semester
            total_complaints = Complaint.objects.filter(
                created_at__gte=semester_start
            ).count()
            
            # Get active complaints (not resolved)
            active_complaints = Complaint.objects.filter(
                status__in=['pending', 'in_progress']
            ).count()
            
            # Calculate resolution rate
            resolved_count = Complaint.objects.filter(
                status='resolved',
                created_at__gte=semester_start
            ).count()
            
            resolved_rate = 0
            if total_complaints > 0:
                resolved_rate = round((resolved_count / total_complaints) * 100)
            
            # Calculate average resolution time (in hours)
            resolved_complaints = Complaint.objects.filter(
                status='resolved',
                created_at__gte=semester_start
            ).exclude(updated_at__isnull=True)
            
            total_hours = 0
            count = 0
            
            for complaint in resolved_complaints:
                if complaint.updated_at and complaint.created_at:
                    delta = complaint.updated_at - complaint.created_at
                    total_hours += delta.total_seconds() / 3600
                    count += 1
            
            avg_resolution_time = round(total_hours / count) if count > 0 else 48
            
            return Response({
                'totalComplaints': total_complaints,
                'activeComplaints': active_complaints,
                'resolvedRate': resolved_rate,
                'avgResolutionTime': avg_resolution_time
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )