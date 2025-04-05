from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    def validate(self, data):
        if self.context['request'].user.user_type == 'student':
            if Complaint.objects.filter(
                user=self.context['request'].user,
                status__in=['Pending', 'In Progress']
            ).count() >= 5:  # Limit active complaints
                raise serializers.ValidationError("You have too many pending complaints")
        return data
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    roll_number = serializers.CharField(source='user.roll_number', read_only=True) 
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'user', 'complaint_name', 'description', 'room_number',
            'complaint_category', 'status', 'place', 'attachment',
            'created_at', 'updated_at', 'roll_number'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'roll_number']
        