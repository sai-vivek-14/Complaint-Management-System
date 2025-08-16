# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.models import Hostel , CustomUser
from ssdash.models import Complaint  # Ensure Complaint isfrom ssdash.serializers import ComplaintSerializer
from rest_framework.permissions import IsAuthenticated


from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.models import  Hostel
from ssdash.models import Complaint
from ssdash.serializers import ComplaintSerializer

class WardenComplaintList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # First check user type
        if user.user_type != 'warden':
            return Response(
                {"detail": "Only wardens can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get the warden's hostel
        try:
            hostel = Hostel.objects.get(warden=user)
        except Hostel.DoesNotExist:
            return Response(
                {"detail": "No hostel assigned to this warden"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get complaints from students in this hostel
        complaints = Complaint.objects.all()

        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ApproveComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):  # ✅ Accept 'pk' here
        try:
            complaint = Complaint.objects.get(pk=pk)
            if complaint.status.lower() == "pending":
                complaint.status = "In Progress"
                complaint.save()
                return Response({"message": "Complaint approved successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Complaint is not in a pending state."}, status=status.HTTP_400_BAD_REQUEST)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"detail": "Complaint approved and set to In Progress."}, status=status.HTTP_200_OK)
class RejectComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):  # ✅ Accept 'pk' here
        try:
            complaint = Complaint.objects.get(pk=pk)
            if complaint.status.lower() == "pending":
                complaint.status = "Rejected"
                complaint.save()
                return Response({"message": "Complaint rejected successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Complaint is not in a pending state."}, status=status.HTTP_400_BAD_REQUEST)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found."}, status=status.HTTP_404_NOT_FOUND)
        complaint.save()

        return Response({"detail": "Complaint rejected and status updated."}, status=status.HTTP_200_OK)