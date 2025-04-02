# adapters.py

from django.db import models

class ComplaintAdapter:
    """
    Adapter class to handle the two different Complaint models
    """
    
    @staticmethod
    def migrate_legacy_complaints(legacy_complaints, new_complaint_model, complaint_type_model, user_model):
        """
        Migrate complaints from the legacy Complaint model to the new one
        
        Parameters:
        - legacy_complaints: QuerySet of complaints from the legacy model
        - new_complaint_model: The new Complaint model class
        - complaint_type_model: The ComplaintType model class
        - user_model: The CustomUser model class
        """
        # Map legacy categories to new complaint types
        category_mapping = {
            'Electrical': 'Electrical',
            'Plumbing': 'Plumbing',
            'Carpenting': 'Carpentry',
            'Water Filter': 'Water Services',
            'Bathroom Clogging': 'Plumbing',
        }
        
        # Ensure all complaint types exist
        for legacy_category, new_category in category_mapping.items():
            complaint_type_model.objects.get_or_create(name=new_category)
        
        # Migrate each complaint
        for legacy_complaint in legacy_complaints:
            # Map legacy status to new status
            status_mapping = {
                'Pending': 'pending',
                'In Progress': 'assigned',
                'Resolved': 'resolved',
            }
            
            # Find corresponding student user (this assumes student roll numbers or usernames match)
            # This is a placeholder - you'll need to determine how to map legacy complaints to users
            student = user_model.objects.filter(user_type='student').first()
            
            # Get or create complaint type
            legacy_category = legacy_complaint.complaint_category
            new_category_name = category_mapping.get(legacy_category, 'Other')
            complaint_type = complaint_type_model.objects.get(name=new_category_name)
            
            # Create new complaint
            new_complaint = new_complaint_model(
                student=student,
                complaint_type=complaint_type,
                description=f"{legacy_complaint.complaint_name}: {legacy_complaint.description}\nLocation: {legacy_complaint.place}, Room: {legacy_complaint.room_number}",
                status=status_mapping.get(legacy_complaint.status, 'pending'),
                created_at=legacy_complaint.created_at
            )
            new_complaint.save()
            
        return True

def adapt_complaint_for_warden(complaint):
    """
    Format a complaint object for display in the warden dashboard,
    handling differences between the models.
    """
    # This is a simplified example - adapt based on your actual model fields
    # and which model the complaint instance belongs to
    
    if hasattr(complaint, 'complaint_type'):
        # It's the new model
        category = complaint.complaint_type.name
    else:
        # It's the legacy model
        category = complaint.complaint_category
    
    if hasattr(complaint, 'student'):
        # It's the new model
        student = complaint.student
    else:
        # It's the legacy model - would need to find the corresponding student
        student = "Unknown Student"  # Replace with logic to find student
    
    # Return a standardized dictionary with complaint data
    return {
        'id': complaint.id,
        'student': student,
        'category': category,
        'description': complaint.description if hasattr(complaint, 'description') else complaint.complaint_name,
        'status': complaint.get_status_display() if hasattr(complaint, 'get_status_display') else complaint.status,
        'created_at': complaint.created_at,
    }