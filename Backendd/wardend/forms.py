# forms.py

from django import forms
from .models import Complaint, CustomUser, ComplaintType

class ComplaintFilterForm(forms.Form):
    """Form for filtering complaints in the warden dashboard"""
    STATUS_CHOICES = (
        ('', 'All Statuses'),
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('resolved', 'Resolved'),
    )
    
    status = forms.ChoiceField(choices=STATUS_CHOICES, required=False)
    category = forms.ModelChoiceField(
        queryset=ComplaintType.objects.all(),
        empty_label="All Categories",
        required=False
    )
    
    # Date range filters
    start_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    end_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date'})
    )

class ComplaintAssignForm(forms.Form):
    """Form for assigning complaints to workers"""
    
    worker = forms.ModelChoiceField(
        queryset=CustomUser.objects.filter(user_type='worker'),
        empty_label="-- Select Worker --",
        required=True
    )
    
    notes = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3}),
        required=False
    )
    
    def __init__(self, *args, complaint_type=None, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Filter workers by complaint type if provided
        if complaint_type:
            self.fields['worker'].queryset = CustomUser.objects.filter(
                user_type='worker',
                worker_profile__is_available=True,
                worker_profile__complaint_types=complaint_type
            )