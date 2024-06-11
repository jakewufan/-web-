function updateCpuChart(cpuData, labels) {
    var ctxCpu = document.getElementById('cpuChart').getContext('2d');

    // 计算总的 CPU 使用率
    var totalCpuUsage = cpuData.reduce((acc, curr) => acc + curr, 0);

    // 计算每个主机的 CPU 使用率百分比
    var cpuPercentage = cpuData.map(cpu => (cpu / totalCpuUsage) * 100);

    var cpuChart = new Chart(ctxCpu, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'CPU 使用率 (%)',
                data: cpuPercentage,
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

    // 计算总的内存使用情况
    var totalMemoryUsage = memoryData.reduce((acc, curr) => acc + curr, 0);

    // 计算每个主机的内存使用情况百分比
    var memoryPercentage = memoryData.map(memory => (memory / totalMemoryUsage) * 100);

    var memoryChart = new Chart(ctxMemory, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '内存使用情况 (%)',
                data: memoryPercentage,
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
