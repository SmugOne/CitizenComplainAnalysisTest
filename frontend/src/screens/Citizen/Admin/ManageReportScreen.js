import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LayoutAdmin from '../../../components/LayoutAdmin';

export default function ManageReportScreen({ navigation }) {
  const [reportType, setReportType] = useState('summary');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async (format) => {
    setLoading(true);
    
    try {
      // Get current dates if not set
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
      })();

      const params = new URLSearchParams({
        report_type: reportType,
        start_date: start,
        end_date: end,
        category: category,
        format: format
      });

      // Use your local network IP for React Native to connect to Flask
      const url = `http://192.168.1.8:5000/generate_report?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      if (format === 'pdf') {
        Alert.alert(
          'Success',
          'PDF report generated successfully! Check your downloads folder.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Success',
          'Report preview opened in browser',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Failed to generate report: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
                <Picker.Item label="MMDA" value="mmda" />
                <Picker.Item label="PNP" value="pnp" />
                <Picker.Item label="BFP" value="bfp" />
                <Picker.Item label="OMBUDSMAN" value="ombudsman" />
                <Picker.Item label="Other" value="other" />
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
                <Text style={styles.dateValue}>{startDate || 'Last 30 days'}</Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{endDate || 'Today'}</Text>
              </View>
            </View>
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
              onPress={() => generateReport('html')}
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
              onPress={() => generateReport('pdf')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>📥 Generate PDF</Text>
              )}
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
});