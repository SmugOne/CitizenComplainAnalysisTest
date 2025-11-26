import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LayoutAdmin from '../../../components/LayoutAdmin';

export default function ManageReportScreen({ navigation }) {
  const [reportType, setReportType] = useState('summary');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Backend URL - change this to your Flask server IP
  const BACKEND_URL = 'http://192.168.1.3:5000';

  const previewReport = async () => {
    setLoading(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('report_type', reportType);
      formData.append('date_from', startDate);
      formData.append('date_to', endDate);
      formData.append('category', category);

      const url = `${BACKEND_URL}/preview-report`;
      
      // Open preview in browser
      const previewUrl = `${url}?report_type=${reportType}&date_from=${startDate}&date_to=${endDate}&category=${category}`;
      
      const canOpen = await Linking.canOpenURL(previewUrl);
      
      if (canOpen) {
        await Linking.openURL(previewUrl);
        Alert.alert(
          'Preview Opened',
          'Report preview has been opened in your browser',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Cannot open browser');
      }
    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert(
        'Error', 
        `Failed to preview report: ${error.message}\n\nMake sure Flask server is running at ${BACKEND_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('report_type', reportType);
      formData.append('date_from', startDate);
      formData.append('date_to', endDate);
      formData.append('category', category);

      const url = `${BACKEND_URL}/generate-report`;
      
      console.log('Generating report:', {
        type: reportType,
        category,
        dateRange: `${startDate || 'All'} to ${endDate || 'Today'}`
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // For React Native, we need to handle the PDF differently
      // Option 1: Open PDF in browser
      const pdfUrl = `${url}?report_type=${reportType}&date_from=${startDate}&date_to=${endDate}&category=${category}`;
      
      Alert.alert(
        'Success',
        'Report generated successfully! Opening PDF...',
        [
          {
            text: 'Open PDF',
            onPress: async () => {
              const canOpen = await Linking.canOpenURL(pdfUrl);
              if (canOpen) {
                await Linking.openURL(pdfUrl);
              } else {
                Alert.alert('Error', 'Cannot open PDF viewer');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );

    } catch (error) {
      console.error('Generate report error:', error);
      Alert.alert(
        'Error',
        `Failed to generate report: ${error.message}\n\nTroubleshooting:\n- Check if Flask server is running\n- Verify server address: ${BACKEND_URL}\n- Ensure CSV data files exist`
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to get date display text
  const getStartDateDisplay = () => {
    if (startDate) return startDate;
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const getEndDateDisplay = () => {
    if (endDate) return endDate;
    return new Date().toISOString().split('T')[0];
  };

  return (
    <LayoutAdmin navigation={navigation}>
      <View style={styles.container}>
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
                onValueChange={(value) => setReportType(value)}
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
                onValueChange={(value) => setCategory(value)}
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

          {/* Date Range */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Range</Text>
            <Text style={styles.hint}>Defaults to last 30 days if not specified</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>{getStartDateDisplay()}</Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{getEndDateDisplay()}</Text>
              </View>
            </View>
            
            {/* Note about date selection */}
            <Text style={styles.dateNote}>
              ℹ️ To change dates, use the web interface at: {BACKEND_URL}/reports
            </Text>
          </View>

          {/* Report Info */}
          <View style={styles.reportInfo}>
            <Text style={styles.reportInfoTitle}>📊 Report Details</Text>
            <Text style={styles.reportInfoText}>
              • Type: <Text style={styles.reportInfoBold}>{reportType}</Text>
            </Text>
            <Text style={styles.reportInfoText}>
              • Category: <Text style={styles.reportInfoBold}>{category === 'all' ? 'All Categories' : category}</Text>
            </Text>
            <Text style={styles.reportInfoText}>
              • Date Range: <Text style={styles.reportInfoBold}>{getStartDateDisplay()} to {getEndDateDisplay()}</Text>
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 <Text style={styles.infoBold}>Tip:</Text> Preview your report first to ensure the data looks correct before generating the PDF.
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

          {/* Web Interface Link */}
          <TouchableOpacity
            style={styles.webLinkButton}
            onPress={async () => {
              const webUrl = `${BACKEND_URL}/reports`;
              const canOpen = await Linking.canOpenURL(webUrl);
              if (canOpen) {
                await Linking.openURL(webUrl);
              } else {
                Alert.alert('Error', 'Cannot open browser');
              }
            }}
          >
            <Text style={styles.webLinkText}>
              🌐 Open Full Report Generator in Browser
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server Status Info */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>🔧 Server Configuration</Text>
          <Text style={styles.statusText}>Backend URL: {BACKEND_URL}</Text>
          <Text style={styles.statusHint}>
            Make sure Flask server is running and accessible from this device
          </Text>
        </View>
      </View>
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#f7f1de',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#11493f',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#11493f',
    fontWeight: '600',
  },
  dateNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
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
  infoBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#11493f',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#11493f',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  webLinkButton: {
    backgroundColor: '#f7f1de',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#11493f',
    borderStyle: 'dashed',
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusHint: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 4,
  },
});