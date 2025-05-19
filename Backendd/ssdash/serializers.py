from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    def validate(self, data):
        if self.context['request'].user.user_type == 'student':
            if Complaint.objects.filter(
                user=self.context['request'].user,
                status__in=['Pending', 'In Progress']
            ).count() >= 5:
                raise serializers.ValidationError("You have too many pending complaints")
        return data

    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    roll_number = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()
    hostel_name = serializers.SerializerMethodField()

    def get_roll_number(self, obj):
        return obj.user.roll_number

    def get_student_name(self, obj):
        return obj.user.username

    def get_room_number(self, obj):
        return obj.user.student_profile.room.room_number if hasattr(obj.user, 'student_profile') else None

    def get_hostel_name(self, obj):
        return obj.user.student_profile.room.hostel.name if hasattr(obj.user, 'student_profile') else None

    class Meta:
        model = Complaint
        fields = [
            'id', 'user', 'complaint_name', 'description', 'room_number',
            'complaint_category', 'status', 'place', 'attachment',
            'created_at', 'updated_at', 'roll_number', 'student_name', 'hostel_name'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'status',
            'roll_number', 'student_name', 'room_number', 'hostel_name'
        ]
