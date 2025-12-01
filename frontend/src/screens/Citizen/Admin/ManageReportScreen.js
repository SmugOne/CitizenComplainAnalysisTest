import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LayoutAdmin from '../../../components/LayoutAdmin';
import { API_URL } from "@env";

export default function ManageReportScreen({ navigation }) {
  const [reportType, setReportType] = useState('summary');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Log API_URL on component mount for debugging
  useEffect(() => {
    console.log('=== ManageReport Screen Loaded ===');
    console.log('API_URL:', API_URL);
    console.log('Initial Start Date:', formatDate(startDate));
    console.log('Initial End Date:', formatDate(endDate));
  }, []);

  // Format date for display and API (YYYY-MM-DD)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle start date change
  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      console.log('Start date changed to:', formatDate(selectedDate));
      setStartDate(selectedDate);
      // Don't auto-adjust end date - let user choose freely
    }
  };

  // Handle end date change
  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      console.log('End date changed to:', formatDate(selectedDate));
      setEndDate(selectedDate);
      // Don't validate here - will validate on preview/generate
    }
  };

  // Validate dates before making API calls
  const validateDates = () => {
    if (startDate > endDate) {
      Alert.alert('Invalid Date Range', 'Start date cannot be after end date. Please adjust your dates.');
      return false;
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day
    
    if (startDate > today) {
      Alert.alert('Invalid Date', 'Start date cannot be in the future. Please select a past date.');
      return false;
    }
    
    if (endDate > today) {
      Alert.alert('Invalid Date', 'End date cannot be in the future. Please select today or an earlier date.');
      return false;
    }
    
    return true;
  };

  const previewReport = async () => {
    console.log('\n=== PREVIEW REPORT CLICKED ===');
    
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    
    try {
      const params = {
        report_type: reportType,
        date_from: formatDate(startDate),
        date_to: formatDate(endDate),
        category: category
      };

      console.log('Preview Parameters:', params);

      const queryString = new URLSearchParams(params).toString();
      const previewUrl = `${API_URL}/api/preview-report?${queryString}`;
      
      console.log('Preview URL:', previewUrl);
      console.log('Attempting to open preview in browser...');
      
      const canOpen = await Linking.canOpenURL(previewUrl);
      console.log('Can open URL:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(previewUrl);
        Alert.alert('Success', 'Report preview opened in browser');
      } else {
        throw new Error('Cannot open browser - URL may be invalid');
      }
    } catch (error) {
      console.error('❌ Preview error:', error);
      Alert.alert(
        'Preview Error', 
        `Failed to open preview:\n\n${error.message}\n\nTroubleshooting:\n1. Check if Flask server is running\n2. Verify API_URL: ${API_URL}\n3. Check network connection\n4. Try the "Open Full Web Generator" button`
      );
    } finally {
      setLoading(false);
      console.log('=== PREVIEW REQUEST COMPLETE ===\n');
    }
  };

  const generateReport = async () => {
    console.log('\n=== GENERATE PDF CLICKED ===');
    
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    
    try {
      const params = {
        report_type: reportType,
        date_from: formatDate(startDate),
        date_to: formatDate(endDate),
        category: category
      };

      console.log('Generate Parameters:', params);

      const queryString = new URLSearchParams(params).toString();
      const pdfUrl = `${API_URL}/api/generate-report?${queryString}`;
      
      console.log('PDF URL:', pdfUrl);
      console.log('Attempting to generate and download PDF...');
      
      const canOpen = await Linking.canOpenURL(pdfUrl);
      console.log('Can open URL:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(pdfUrl);
        Alert.alert(
          'PDF Generation Started', 
          'Your PDF report is being generated and will download automatically in your browser.'
        );
      } else {
        throw new Error('Cannot open browser - URL may be invalid');
      }
    } catch (error) {
      console.error('❌ Generate error:', error);
      Alert.alert(
        'Generation Error', 
        `Failed to generate PDF:\n\n${error.message}\n\nTroubleshooting:\n1. Check if Flask server is running at ${API_URL}\n2. Verify your date range has data\n3. Check network connection\n4. Try preview first to test connection`
      );
    } finally {
      setLoading(false);
      console.log('=== GENERATE REQUEST COMPLETE ===\n');
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing connection to:', API_URL);
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'GET',
      });
      
      if (response.ok) {
        Alert.alert('Connection Success', `Successfully connected to server at ${API_URL}`);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert(
        'Connection Failed',
        `Cannot reach server at ${API_URL}\n\nError: ${error.message}\n\nMake sure Flask server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAdmin navigation={navigation}>
      <ScrollView style={styles.container}>
        {/* Page Title */}
        <Text style={styles.pageTitle}>Generate Reports</Text>

        {/* Report Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report Configuration</Text>

          {/* Report Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Report Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={reportType}
                onValueChange={(value) => {
                  console.log('Report type changed to:', value);
                  setReportType(value);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Summary Report" value="summary" />
                <Picker.Item label="Detailed Report" value="detailed" />
                <Picker.Item label="Category Analysis" value="category" />
                <Picker.Item label="Trend Analysis" value="trend" />
              </Picker>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category Filter</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => {
                  console.log('Category changed to:', value);
                  setCategory(value);
                }}
                style={styles.picker}
              >
                <Picker.Item label="All Categories" value="all" />
                <Picker.Item label="DPWH - Infrastructure" value="DPWH" />
                <Picker.Item label="DOH - Health" value="DOH" />
                <Picker.Item label="DENR - Environment" value="DENR" />
                <Picker.Item label="Ombudsman" value="OMBUDSMAN" />
                <Picker.Item label="LTO - Transportation" value="LTO" />
                <Picker.Item label="MMDA - Metro Manila" value="MMDA" />
                <Picker.Item label="PNP - Police" value="PNP" />
                <Picker.Item label="DepEd - Education" value="DEPED" />
                <Picker.Item label="BFP - Fire" value="BFP" />
                <Picker.Item label="DOTR - Transportation" value="DOTR" />
                <Picker.Item label="DITC - Technology" value="DITC" />
              </Picker>
            </View>
          </View>

          {/* Date Range Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Range</Text>
            <Text style={styles.hint}>
              Select any date range. Both dates are fully editable.
            </Text>
            
            {/* Start Date */}
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowStartPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            {/* End Date */}
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowEndPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            {/* Quick Date Range Presets */}
            <View style={styles.presetContainer}>
              {/*<Text style={styles.presetLabel}>Quick Select:</Text> */}
              <View style={styles.presetButtons}>
                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 7);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                >
                  <Text style={styles.presetButtonText}>Last 7 days</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 30);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                >
                  <Text style={styles.presetButtonText}>Last 30 days</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 90);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                >
                  <Text style={styles.presetButtonText}>Last 90 days</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => {
                    const end = new Date();
                    const start = new Date(end.getFullYear(), 0, 1); // Jan 1 of current year
                    setStartDate(start);
                    setEndDate(end);
                  }}
                >
                  <Text style={styles.presetButtonText}>This Year</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Pickers - No restrictions, fully editable */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartDateChange}
                maximumDate={new Date()}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Report Info */}
          <View style={styles.reportInfo}>
            <Text style={styles.reportInfoTitle}>📊 Report Details</Text>
            <Text style={styles.reportInfoText}>
              • Type: <Text style={styles.reportInfoBold}>{reportType}</Text>
            </Text>
            <Text style={styles.reportInfoText}>
              • Category: <Text style={styles.reportInfoBold}>
                {category === 'all' ? 'All Categories' : category}
              </Text>
            </Text>
            <Text style={styles.reportInfoText}>
              • Date Range: <Text style={styles.reportInfoBold}>
                {formatDate(startDate)} to {formatDate(endDate)}
              </Text>
            </Text>
            <Text style={styles.reportInfoText}>
              • Days included: <Text style={styles.reportInfoBold}>
                {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days
              </Text>
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={previewReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>👁️ Preview Report</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={generateReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>📥 Generate PDF</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Test Connection Button */}
          {/* <TouchableOpacity
            style={styles.testButton}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>
              🔌 Test Server Connection
            </Text>
          </TouchableOpacity> */}

          {/* Web Link Button */}
          <TouchableOpacity
            style={styles.webLinkButton}
            onPress={async () => {
              const webUrl = `${API_URL}/api/reports`;
              console.log('Opening web generator at:', webUrl);
              try {
                const canOpen = await Linking.canOpenURL(webUrl);
                if (canOpen) {
                  await Linking.openURL(webUrl);
                } else {
                  Alert.alert('Error', 'Cannot open browser');
                }
              } catch (error) {
                console.error('Error opening web generator:', error);
                Alert.alert('Error', `Cannot open browser: ${error.message}`);
              }
            }}
          >
            <Text style={styles.webLinkText}>
              🌐 Open Full Web Generator
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LayoutAdmin>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11493f',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11493f',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ffd66b',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11493f',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#11493f',
    borderRadius: 8,
    backgroundColor: '#f7f1de',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#11493f',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f1de',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#11493f',
    marginBottom: 12,
  },
  dateButtonContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    color: '#11493f',
    fontWeight: '700',
  },
  calendarIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  reportInfo: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#11493f',
  },
  reportInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11493f',
    marginBottom: 8,
  },
  reportInfoText: {
    fontSize: 13,
    color: '#11493f',
    marginBottom: 4,
  },
  reportInfoBold: {
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  previewButton: {
    backgroundColor: '#11493f',
  },
  downloadButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  testButton: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  webLinkButton: {
    backgroundColor: '#f7f1de',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#11493f',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  webLinkText: {
    color: '#11493f',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 4,
  },
  presetContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#11493f',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#11493f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});