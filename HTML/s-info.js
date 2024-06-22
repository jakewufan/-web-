$(document).ready(function() {
    updateSystemInfo();  // 页面加载时更新系统信息
    setInterval(updateSystemInfo, 300000); // 每5分钟更新一次

    function updateSystemInfo() {
        $.ajax({
            url: 'get_system_info.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                    $('#system-info').html('<p class="error">' + data.error + '</p>');
                } else {
                    $('#system-info').html(data.html);
                    updateCharts(data.cpuData, data.memoryData, data.labels);
                }
            },
            error: function(xhr, status, error) {
                $('#system-info').html('<p class="error">加载系统信息时出错: ' + error + '</p>');
            }
        });
    }

    function updateCharts(cpuData, memoryData, labels) {
        // 转换 CPU 使用率和内存使用情况的百分比为小数，确保总和为 100
        var totalCpuUsage = cpuData.reduce((a, b) => a + b, 0);
        var totalMemoryUsage = memoryData.reduce((a, b) => a + b, 0);

        cpuData = cpuData.map(value => (value / totalCpuUsage) * 100);
        memoryData = memoryData.map(value => (value / totalMemoryUsage) * 100);

        updateCpuChart(cpuData, labels);
        updateMemoryChart(memoryData, labels);
    }

    function updateCpuChart(cpuData, labels) {
        var ctxCpu = document.getElementById('cpuChart').getContext('2d');
        var cpuChart = new Chart(ctxCpu, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CPU 使用率 (%)',
                    data: cpuData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    function updateMemoryChart(memoryData, labels) {
        var ctxMemory = document.getElementById('memoryChart').getContext('2d');
        var memoryChart = new Chart(ctxMemory, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: '内存使用情况 (%)',
                    data: memoryData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // 处理关机按钮点击事件
    $(document).on('submit', '#shutdownForm', function(event) {
        event.preventDefault(); // 阻止表单默认提交行为

        if (confirm('确认要关机吗？')) {
            $.ajax({
                url: 'get_system_info.php',
                type: 'POST',
                data: $(this).serialize(),
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        alert('关机操作已执行');
                        updateSystemInfo(); // 更新系统信息
                    } else {
                        alert('关机操作失败: ' + response.message);
                    }
                },
                error: function(xhr, status, error) {
                    alert('关机操作失败: ' + error);
                }
            });
        }
    });
});
