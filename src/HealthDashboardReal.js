import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField } from '@mui/material';
import healthDatafromAPI from '../../components/consts/healthData'; // Assuming this is where healthDatfromAPi is declared
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Correctly merge dynamicMetrics with fetched metrics
const mergeDynamicMetrics = (fetchedMetrics, dynamicMetrics) => {
  const updatedMetrics = [...fetchedMetrics];
  dynamicMetrics.forEach((metric) => {
    const index = updatedMetrics.findIndex((m) => m.Name === metric.Name)
    if (index > -1) {
      updatedMetrics[index] = metric;
    } else {
      updatedMetrics.push(metric);
    }
  });
  return updatedMetrics;
};

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState({ Metrics: [] });
  const [loading, setLoading] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("white"); // Add this line
  const [themeMode, setThemeMode] = useState("light"); // Default to light mode
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricGoodThreshold, setNewMetricGoodThreshold] = useState("");
  const [newMetricWarningThreshold, setNewMetricWarningThreshold] = useState("");
  const [dynamicMetrics, setDynamicMetrics] = useState([]);
  const [open, setOpen] = useState(false); // FOr handling the form dialog

  const defaultThresholds = {
    heartRate: { good: [60, 100], warning: [101, 120] },
    bloodPressure: { good: [90, 120], warning: [121, 140] },
  };

  // Ensuring overall health status is calculated correctly
  let overallHealth = {
    status: "Good",
    color: "green"
  };

  if (healthData.Metrics.some(metric => metric.Status === "Error")) {
    overallHealth.status = "Critical";
    overallHealth.color = "red";
  } else if (healthData.Metrics.some(metric => metric.Status === "Warning")) {
    overallHealth.status = "Warning";
    overallHealth.color = "orange";
  }

  const getAdjustedThresholds = (activityState) => {
    if (!activityState) {
      return defaultThresholds;
    }

    switch (activityState) {
      case "Resting":
        return {
          heartRate: { good: [60, 100], warning: [101, 120] },
          bloodPressure: { good: [90, 120], warning: [121, 140] }
        };
      case "Exercising":
        return {
          heartRate: { good: [100, 180], warning: [181, 200] },
          bloodPressure: { good: [110, 150], warning: [151, 170] }
        };
      case "Sleeping":
        return {
          heartRate: { good: [50, 70], warning: [71, 90] },
          bloodPressure: { good: [80, 110], warning: [111, 130] }
        };
      default:
        return defaultThresholds;
    }
  };

  const addNewMetric = () => {
    const goodThreshold = newMetricGoodThreshold.split("-").map(Number);
    const warningThreshold = newMetricWarningThreshold.split("-").map(Number);

    let initialStatus = "Good";
    const value = 0; // Initial dummy value for the metric

    if (value >= warningThreshold[0] && value <= warningThreshold[1]) {
      initialStatus = "Warning";
    } else if (value < goodThreshold[0] || value > goodThreshold[1]) {
      initialStatus = "Error";
    }

    const newMetric = {
      Name: newMetricName,
      GoodThreshold: goodThreshold,
      WarningThreshold: warningThreshold,
      Value: `${value} units`,
      Status: initialStatus
    };

    setDynamicMetrics(prevMetrics => [...prevMetrics, newMetric]); // Ensure new metrics are retained
    setHealthData(prevData => ({ ...prevData, Metrics: [...prevData.Metrics, newMetric] }));

    setNewMetricName("");
    setNewMetricGoodThreshold("");
    setNewMetricWarningThreshold("");
    setOpen(false);
  };

  const deleteMetric = (metricName) => {
    const updatedMetrics = healthData.Metrics.filter(metric => metric.Name !== metricName);
    const filteredDynamicMetrics = dynamicMetrics.filter(metric => metric.Name !== metricName);
    setHealthData(prevData => ({ ...prevData, Metrics: updatedMetrics }));
    setDynamicMetrics(filteredDynamicMetrics);
  };

  const getStatusColor = (status) => {
    if (status === "Good") return "green";
    if (status === "Warning") return "orange";
    return "red"; // Critical
  };

  const getTextColor = (statusColor) => {
    return statusColor === "red" ? "black" : "white";
  };

  const updateMetricsWithThresholds = (metrics, thresholds) => {
    if (!Array.isArray(metrics)) return metrics;

    return metrics.map((metric) => {
      const value = parseInt(metric.Value.split(" ")[0], 10);

      // Check heart rate thresholds
      if (metric.Name === "Heart Rate") {
        if (value >= thresholds.heartRate.warning[0] && value <= thresholds.heartRate.warning[1]) {
          return { ...metric, Status: "Warning" };
        } else if (value < thresholds.heartRate.good[0] || value > thresholds.heartRate.good[1]) {
          return { ...metric, Status: "Error" };
        }
        return { ...metric, Status: "Good" };
      }

      // Check blood pressure thresholds
      if (metric.Name === "Blood Pressure") {
        if (value >= thresholds.bloodPressure.warning[0] && value <= thresholds.bloodPressure.warning[1]) {
          return { ...metric, Status: "Warning" };
        } else if (value < thresholds.bloodPressure.good[0] || value > thresholds.bloodPressure.good[1]) {
          return { ...metric, Status: "Error" };
        }
        return { ...metric, Status: "Good" };
      }

      return metric; // Default for other metrics
    });
  };

  const simulateHealthChangesForAllMetrics = () => {
    if (!Array.isArray(healthData.Metrics)) return;
    
    const updatedMetrics = healthData.Metrics.map(metric => {
      const newValue = parseInt(metric.Value.split(" ")[0]) + (Math.random() > 0.5 ? -20 : 20); // Simulate change
      return { ...metric, Value: `${newValue} ${metric.Value.split(" ")[1]}` };
    });

    const thresholds = getAdjustedThresholds(healthData.ActivityState);
    const newMetrics = updateMetricsWithThresholds(updatedMetrics, thresholds);
    setHealthData({ ...healthData, Metrics: newMetrics });
  };

  useEffect(() => {
    const fetchData = () => {
      const newHealthData = { ...healthDatafromAPI }; // Fetch or simulate new health data
      const thresholds = getAdjustedThresholds(newHealthData.ActivityState);

      // Ensure newHealthData.Metrics is an array
      const mergedMetrics = Array.isArray(newHealthData.Metrics)
        ? [...newHealthData.Metrics, ...dynamicMetrics]
        : [...dynamicMetrics];

      const updatedMetrics = updateMetricsWithThresholds(mergedMetrics, thresholds);
      setHealthData({ ...newHealthData, Metrics: updatedMetrics });
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dynamicMetrics]); // Add dynamicMetrics as a dependency

  useEffect(() => {
    document.body.style.backgroundColor = themeMode === "light" ? "white" : "black";
  }, [themeMode]);

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ padding: 2, borderRadius: 2, marginBottom: 3, sbackgroundColor: backgroundColor }}>
      <Button
        variant="contained"
        onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
      >
        {themeMode === "light" ? "Night Mode" : "Light Mode"}
      </Button>  

      {/* "+" Button to openn the form dialog */}
      <Button variant="outlined" sx={{ marginLeft: 2 }} onClick={() => setOpen(true)}>
        +
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Metrics</DialogTitle>
        <DialogContent>
          <TextField
            label="Metric Name"
            value={newMetricName}
            onChange={(e) => setNewMetricName(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Good Threshold (e.g., 60-100)"
            value={newMetricGoodThreshold}
            onChange={(e) => setNewMetricGoodThreshold(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }} // Add spacing between fields
          />
           <Button onClick={addNewMetric} variant="contained" sx={{ marginTop: 2 }}>
            Enter
          </Button>
        </DialogContent>
      </Dialog>

      <Typography variant="h4" gutterBottom style={{ color: themeMode === "light" ? "black" : "white" }}>
        Health Dashboard
      </Typography>

      {/* Overall Health Status */}
      <Box 
        sx={{ 
          backgroundColor: overallHealth.color, 
          padding: 2, 
          borderRadius: 2, 
          marginBottom: 3 
        }}
     >
      <Typography variant="h5" sx={{ color: "white" }}>
        {overallHealth.status}
      </Typography>
      <Typography variant="body1" sx={{ color: "white" }}>
        Activity: {healthData.ActivityState}
      </Typography>
    </Box>

    <Grid container spacing={2}>
        {healthData.Metrics.map((metric, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ backgroundColor: getStatusColor(metric.Status), color: "white" }}>
              <CardContent>
                <Typography variant="h6">{metric.Name}</Typography>
                <Typography variant="body1">Status: {metric.Status}</Typography>
                {metric.Detail && (
                  <Typography variant="body2" mt={2}>
                    <strong>Details:</strong> {metric.Detail}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid> // This was missing
        ))}
      </Grid>
    </Box>
  );
};

export default HealthDashboard;