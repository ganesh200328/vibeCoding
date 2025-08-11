document.addEventListener('DOMContentLoaded', () => {
    // Main app elements
    const fitnessForm = document.getElementById('fitness-form');
    const activityIdInput = document.getElementById('activity-id');
    const activityInput = document.getElementById('activity');
    const durationInput = document.getElementById('duration');
    const distanceInput = document.getElementById('distance');
    const caloriesInput = document.getElementById('calories');
    const dateInput = document.getElementById('date');
    const notesInput = document.getElementById('notes');
    const dashboard = document.getElementById('dashboard');
    const searchInput = document.getElementById('search');
    const themeSwitch = document.getElementById('themeSwitch');
    const toastContainer = document.querySelector('.toast-container');

    // Analytics elements
    const totalActivitiesEl = document.getElementById('total-activities');
    const totalDurationEl = document.getElementById('total-duration');
    const totalCaloriesEl = document.getElementById('total-calories');
    const totalDistanceEl = document.getElementById('total-distance');
    const activityChartCanvas = document.getElementById('activityChart').getContext('2d');
    let activityChart;

    // Profile elements
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('name');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');

    // BMI elements
    const bmiResultEl = document.getElementById('bmi-result');
    const bmiCategoryEl = document.getElementById('bmi-category');

    // Goals elements
    const durationProgress = document.getElementById('duration-progress');
    const distanceProgress = document.getElementById('distance-progress');
    const caloriesProgress = document.getElementById('calories-progress');
    const durationProgressLabel = document.getElementById('duration-progress-label');
    const distanceProgressLabel = document.getElementById('distance-progress-label');
    const caloriesProgressLabel = document.getElementById('calories-progress-label');

    // Water intake elements
    const waterIntakeEl = document.getElementById('water-intake');
    const addWaterBtn = document.getElementById('add-water');
    const removeWaterBtn = document.getElementById('remove-water');

    // Data
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    let waterIntake = JSON.parse(localStorage.getItem('waterIntake')) || { date: new Date().toLocaleDateString(), count: 0 };
    const goals = { duration: 150, distance: 20, calories: 2000 }; // Weekly goals

    const renderActivities = (filteredActivities = activities) => {
        dashboard.innerHTML = '';
        if (filteredActivities.length === 0) {
            dashboard.innerHTML = '<p class="text-center">No activities logged yet. Add one to get started!</p>';
            return;
        }

        filteredActivities.forEach(activity => {
            const activityCard = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${activity.activity}</h5>
                            <p class="card-text"><i class="fas fa-stopwatch"></i> ${activity.duration} minutes</p>
                            <p class="card-text"><i class="fas fa-road"></i> ${activity.distance} km</p>
                            <p class="card-text"><i class="fas fa-fire"></i> ${activity.calories} calories</p>
                            <p class="card-text"><i class="fas fa-calendar-alt"></i> ${activity.date}</p>
                            <p class="card-text"><i class="fas fa-sticky-note"></i> ${activity.notes || 'No notes'}</p>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editActivity('${activity.id}')"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteActivity('${activity.id}')"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
            dashboard.innerHTML += activityCard;
        });
    };

    const updateAnalytics = () => {
        const totalActivities = activities.length;
        const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
        const totalCalories = activities.reduce((sum, act) => sum + act.calories, 0);
        const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0);

        totalActivitiesEl.textContent = totalActivities;
        totalDurationEl.textContent = `${(totalDuration / 60).toFixed(1)}h`;
        totalCaloriesEl.textContent = totalCalories;
        totalDistanceEl.textContent = `${totalDistance.toFixed(2)}km`;

        updateChart();
        updateGoals();
    };

    const updateChart = () => {
        const activityTypes = [...new Set(activities.map(act => act.activity))];
        const data = activityTypes.map(type => {
            return activities.filter(act => act.activity === type).reduce((sum, act) => sum + act.duration, 0);
        });

        if (activityChart) {
            activityChart.destroy();
        }

        activityChart = new Chart(activityChartCanvas, {
            type: 'doughnut',
            data: {
                labels: activityTypes,
                datasets: [{
                    label: 'Activity Duration (minutes)',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#fff' : '#333'
                        }
                    }
                }
            }
        });
    };

    const updateGoals = () => {
        const weeklyActivities = activities.filter(act => {
            const activityDate = new Date(act.date);
            const today = new Date();
            const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            return activityDate >= oneWeekAgo;
        });

        const weeklyDuration = weeklyActivities.reduce((sum, act) => sum + act.duration, 0);
        const weeklyDistance = weeklyActivities.reduce((sum, act) => sum + act.distance, 0);
        const weeklyCalories = weeklyActivities.reduce((sum, act) => sum + act.calories, 0);

        const durationPercentage = Math.min((weeklyDuration / goals.duration) * 100, 100);
        const distancePercentage = Math.min((weeklyDistance / goals.distance) * 100, 100);
        const caloriesPercentage = Math.min((weeklyCalories / goals.calories) * 100, 100);

        durationProgress.style.width = `${durationPercentage}%`;
        distanceProgress.style.width = `${distancePercentage}%`;
        caloriesProgress.style.width = `${caloriesPercentage}%`;

        durationProgress.setAttribute('aria-valuenow', weeklyDuration);
        distanceProgress.setAttribute('aria-valuenow', weeklyDistance);
        caloriesProgress.setAttribute('aria-valuenow', weeklyCalories);

        durationProgressLabel.textContent = `${weeklyDuration}/${goals.duration} min`;
        distanceProgressLabel.textContent = `${weeklyDistance.toFixed(2)}/${goals.distance} km`;
        caloriesProgressLabel.textContent = `${weeklyCalories}/${goals.calories} kcal`;
    };

    const updateWaterIntake = () => {
        const today = new Date().toLocaleDateString();
        if (waterIntake.date !== today) {
            waterIntake.date = today;
            waterIntake.count = 0;
        }
        waterIntakeEl.textContent = waterIntake.count;
        localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
    };

    const calculateBMI = () => {
        if (userProfile.weight && userProfile.height) {
            const heightInMeters = userProfile.height / 100;
            const bmi = userProfile.weight / (heightInMeters * heightInMeters);
            bmiResultEl.textContent = bmi.toFixed(2);

            let category = '';
            if (bmi < 18.5) category = 'Underweight';
            else if (bmi < 25) category = 'Normal weight';
            else if (bmi < 30) category = 'Overweight';
            else category = 'Obesity';
            bmiCategoryEl.textContent = category;
        } else {
            bmiResultEl.textContent = 'N/A';
            bmiCategoryEl.textContent = 'Please set your weight and height in the profile.';
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        setTimeout(() => bsToast.hide(), 3000);
    };

    fitnessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = activityIdInput.value;
        const newActivity = {
            id: id || new Date().getTime().toString(),
            activity: activityInput.value,
            duration: parseInt(durationInput.value),
            distance: parseFloat(distanceInput.value),
            calories: parseInt(caloriesInput.value),
            date: dateInput.value,
            notes: notesInput.value
        };

        if (id) {
            activities = activities.map(act => act.id === id ? newActivity : act);
            showToast('Activity updated successfully!');
        } else {
            activities.push(newActivity);
            showToast('Activity added successfully!');
        }

        localStorage.setItem('activities', JSON.stringify(activities));
        renderActivities();
        updateAnalytics();
        fitnessForm.reset();
        activityIdInput.value = '';
        const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
        modal.hide();
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userProfile.name = nameInput.value;
        userProfile.weight = parseFloat(weightInput.value);
        userProfile.height = parseFloat(heightInput.value);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        showToast('Profile saved successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
        modal.hide();
        calculateBMI();
    });

    window.editActivity = (id) => {
        const activity = activities.find(act => act.id === id);
        if (activity) {
            activityIdInput.value = activity.id;
            activityInput.value = activity.activity;
            durationInput.value = activity.duration;
            distanceInput.value = activity.distance;
            caloriesInput.value = activity.calories;
            dateInput.value = activity.date;
            notesInput.value = activity.notes;
            const modal = new bootstrap.Modal(document.getElementById('activityModal'));
            modal.show();
        }
    };

    window.deleteActivity = (id) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            activities = activities.filter(act => act.id !== id);
            localStorage.setItem('activities', JSON.stringify(activities));
            renderActivities();
            updateAnalytics();
            showToast('Activity deleted successfully!', 'danger');
        }
    };

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredActivities = activities.filter(act => act.activity.toLowerCase().includes(searchTerm) || (act.notes && act.notes.toLowerCase().includes(searchTerm)));
        renderActivities(filteredActivities);
    });

    themeSwitch.addEventListener('change', () => {
        document.documentElement.setAttribute('data-bs-theme', themeSwitch.checked ? 'dark' : 'light');
        updateChart();
    });

    addWaterBtn.addEventListener('click', () => {
        waterIntake.count++;
        updateWaterIntake();
    });

    removeWaterBtn.addEventListener('click', () => {
        if (waterIntake.count > 0) {
            waterIntake.count--;
            updateWaterIntake();
        }
    });

    // Initial setup
    const init = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themeSwitch.checked = true;
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }

        if (userProfile.name) nameInput.value = userProfile.name;
        if (userProfile.weight) weightInput.value = userProfile.weight;
        if (userProfile.height) heightInput.value = userProfile.height;

        renderActivities();
        updateAnalytics();
        calculateBMI();
        updateWaterIntake();
    };

    init();
});