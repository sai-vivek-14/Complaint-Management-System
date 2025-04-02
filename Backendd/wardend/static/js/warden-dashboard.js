// static/js/warden-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Fetch complaint statistics for charts
    fetch('/warden/api/complaint-statistics/?period=week')
        .then(response => response.json())
        .then(data => {
            // Timeline chart
            const timelineCtx = document.getElementById('complaintTimelineChart').getContext('2d');
            const timelineChart = new Chart(timelineCtx, {
                type: 'line',
                data: data.timeline,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Complaints Timeline'
                        }
                    }
                }
            });
            
            // Category pie chart
            const categoryCtx = document.getElementById('complaintCategoryChart').getContext('2d');
            const categoryChart = new Chart(categoryCtx, {
                type: 'pie',
                data: data.categories,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Complaints by Category'
                        },
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching statistics:', error));
        
    // Time period selector for charts
    const periodSelector = document.getElementById('chartPeriodSelector');
    if (periodSelector) {
        periodSelector.addEventListener('change', function() {
            const period = this.value;
            fetch(`/warden/api/complaint-statistics/?period=${period}`)
                .then(response => response.json())
                .then(data => {
                    // Update the charts with new data
                    timelineChart.data = data.timeline;
                    timelineChart.update();
                    
                    categoryChart.data = data.categories;
                    categoryChart.update();
                })
                .catch(error => console.error('Error updating statistics:', error));
        });
    }
    
    // Hostel statistics
    fetch('/warden/api/hostel-statistics/')
        .then(response => response.json())
        .then(data => {
            // Update DOM elements with hostel stats
            document.getElementById('occupancyRate').textContent = `${data.occupancy_rate}%`;
            document.getElementById('capacityUtilization').textContent = `${data.capacity_utilization}%`;
            
            // Create occupancy progress bar
            const occupancyBar = document.getElementById('occupancyProgressBar');
            if (occupancyBar) {
                occupancyBar.style.width = `${data.capacity_utilization}%`;
                occupancyBar.setAttribute('aria-valuenow', data.capacity_utilization);
            }
            
            // Room statistics pie chart
            const roomsCtx = document.getElementById('roomsChart').getContext('2d');
            const roomsChart = new Chart(roomsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Full Rooms', 'Partially Occupied', 'Empty Rooms'],
                    datasets: [{
                        data: [
                            data.full_rooms, 
                            data.occupied_rooms - data.full_rooms, 
                            data.total_rooms - data.occupied_rooms
                        ],
                        backgroundColor: [
                            'rgba(25, 135, 84, 0.7)',
                            'rgba(13, 110, 253, 0.7)',
                            'rgba(173, 181, 189, 0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Room Occupancy'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching hostel statistics:', error));
    
    // Complaint approval handler
    const assignForms = document.querySelectorAll('.complaint-assign-form');
    assignForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const complaintId = this.getAttribute('data-complaint-id');
            const workerId = this.querySelector('select[name="worker"]').value;
            
            if (!workerId) {
                e.preventDefault();
                alert('Please select a worker to assign this complaint to.');
            }
        });
    });
});