<?php
$files = glob('/var/www/html/status_*.json');
$cpuData = [];
$memoryData = [];
$labels = [];

$response = array();

if (empty($files)) {
    $response['error'] = '未找到状态文件。';
} else {
    $html = '<table>';
    $html .= '<tr><th>主机名</th><th>运行时间</th><th>CPU使用率</th><th>内存使用情况</th><th>磁盘使用情况</th><th>网络流量</th><th>系统负载</th><th>在线状态</th><th>操作</th></tr>';

    foreach ($files as $file) {
        $json = file_get_contents($file);
        if ($json === false) {
            $html .= "<tr><td colspan='9' class='error'>无法读取文件: $file</td></tr>";
            continue;
        }

        $data = json_decode($json, true);
        if ($data === null) {
            $html .= "<tr><td colspan='9' class='error'>无法解析JSON: $file</td></tr>";
            continue;
        }

        $cpuData[] = floatval(trim($data['cpu_usage'], '%'));
        $memoryData[] = floatval(trim($data['memory_usage'], '%'));
        $labels[] = htmlspecialchars($data['hostname']);

        $html .= '<tr>';
        $html .= '<td>' . htmlspecialchars($data['hostname']) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['uptime']) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['cpu_usage']) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['memory_usage']) . '</td>';
        $html .= '<td>' . nl2br(htmlspecialchars($data['disk_usage'])) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['network_traffic']) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['system_load']) . '</td>';
        $html .= '<td>' . htmlspecialchars($data['online_status']) . '</td>';
        $html .= '<td>';
        $html .= '<form method="post" action="">';
        $html .= '<input type="hidden" name="hostname" value="' . htmlspecialchars($data['hostname']) . '">';
        $html .= '<input class="btn" type="submit" name="shutdown" value="关机" onclick="return confirm(\'确认要关机吗？\');">';
        $html .= '</form>';
        $html .= '</td>';
        $html .= '</tr>';
    }

    $html .= '</table>';

    $response['html'] = $html;
    $response['cpuData'] = $cpuData;
    $response['memoryData'] = $memoryData;
    $response['labels'] = $labels;
}

header('Content-Type: application/json');
echo json_encode($response);
?>

