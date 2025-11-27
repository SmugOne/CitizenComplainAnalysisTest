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
import { API_URL } from "@env";

export default function ManageReportScreen({ navigation }) {
  const [reportType, setReportType] = useState('summary');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const previewReport = async () => {
    setLoading(true);
    try {
      const previewUrl = `${API_URL}/preview-report?report_type=${reportType}&date_from=${startDate}&date_to=${endDate}&category=${category}`;
      
      const canOpen = await Linking.canOpenURL(previewUrl);
      if (canOpen) {
        await Linking.openURL(previewUrl);
        Alert.alert('Preview Opened', 'Report preview has been opened in your browser');
      } else {
        throw new Error('Cannot open browser');
      }
    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert('Error', `Failed to preview report: ${error.message}\nMake sure Flask server is running at ${API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Use GET to match backend behavior for opening PDF in browser
      const pdfUrl = `${API_URL}/generate-report?...`;
      
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) {
        await Linking.openURL(pdfUrl);
        Alert.alert('Success', 'PDF report opened in your browser.');
      } else {
        throw new Error('Cannot open PDF viewer');
      }
    } catch (error) {
      console.error('Generate report error:', error);
      Alert.alert('Error', `Failed to generate report: ${error.message}\nCheck if Flask server is running and accessible`);
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

            <TouchableOpacity
              style={[styles.button, styles.webLinkButton, { flex: 1 }]}
              onPress={async () => {
                const webUrl = `${API_URL}/reports`;
                const canOpen = await Linking.canOpenURL(webUrl);
                if (canOpen) {
                  await Linking.openURL(webUrl);
                } else {
                  Alert.alert('Error', 'Cannot open browser');
                }
              }}
            >
              <Text style={[styles.buttonText, { color: '#11493f', fontWeight: '600' }]}>
                🌐 Open Full Generator
              </Text>
            </TouchableOpacity>
          </View>
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