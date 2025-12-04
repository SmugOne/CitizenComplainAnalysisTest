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

  useEffect(() => {
    console.log('=== ManageReport Screen Loaded ===');
    console.log('API_URL:', API_URL);
    console.log('Initial Start Date:', formatDate(startDate));
    console.log('Initial End Date:', formatDate(endDate));
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const validateDates = () => {
    if (startDate > endDate) {
      Alert.alert('Invalid Date Range', 'Start date cannot be after end date. Please adjust your dates.');
      return false;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
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
    if (!validateDates()) return;
    setLoading(true);
    try {
      const params = {
        report_type: reportType,
        date_from: formatDate(startDate),
        date_to: formatDate(endDate),
        category: category
      };
      const queryString = new URLSearchParams(params).toString();
      const previewUrl = `${API_URL}/api/preview-report?${queryString}`;
      const canOpen = await Linking.canOpenURL(previewUrl);
      if (canOpen) {
        await Linking.openURL(previewUrl);
        Alert.alert('Success', 'Report preview opened in browser');
      } else {
        throw new Error('Cannot open browser - URL may be invalid');
      }
    } catch (error) {
      Alert.alert('Preview Error', `Failed to open preview:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!validateDates()) return;
    setLoading(true);
    try {
      const params = {
        report_type: reportType,
        date_from: formatDate(startDate),
        date_to: formatDate(endDate),
        category: category
      };
      const queryString = new URLSearchParams(params).toString();
      const pdfUrl = `${API_URL}/api/generate-report?${queryString}`;
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) {
        await Linking.openURL(pdfUrl);
        Alert.alert('PDF Generation Started', 'Your PDF report is being generated and will download automatically in your browser.');
      } else {
        throw new Error('Cannot open browser - URL may be invalid');
      }
    } catch (error) {
      Alert.alert('Generation Error', `Failed to generate PDF:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickSelectPreset = (daysOrYear) => {
    const end = new Date();
    let start;
    if (daysOrYear === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start = new Date();
      start.setDate(end.getDate() - daysOrYear);
    }
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <LayoutAdmin navigation={navigation}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Generate Reports</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report Configuration</Text>
          {/* Report Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Report Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={reportType}
                onValueChange={value => setReportType(value)}
                style={styles.picker}>
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
                onValueChange={value => setCategory(value)}
                style={styles.picker}
              >
                <Picker.Item label="All Categories" value="all" />
                <Picker.Item label="DPWH - Infrastructure" value="DPWH" />
                <Picker.Item label="DOH - Health" value="DOH" />
                <Picker.Item label="DENR - Environment" value="DENR" />
                <Picker.Item label="Ombudsman" value="OMBUDSMAN" />
                <Picker.Item label="Traffic Management" value="TRAFFIC MANAGEMENT" />
                <Picker.Item label="PNP - Police" value="PNP" />
                <Picker.Item label="DepEd - Education" value="DEPED" />
                <Picker.Item label="BFP - Fire" value="BFP" />
                <Picker.Item label="DOTR - Transportation" value="DOTR" />
                <Picker.Item label="DITC - Technology" value="DITC" />
                <Picker.Item label="Others" value="OTHERS" />
              </Picker>
            </View>
          </View>

          {/* Date Range Selection (Side by Side) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Range</Text>
            <Text style={styles.hint}>
              Select any date range. Both dates are fully editable.
            </Text>
            <View style={styles.dateRangeRow}>
              {/* Start Date */}
              <View style={styles.dateFieldBox}>
                <View style={styles.dateFieldInner}>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                  <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dateFieldLabel}>Start date</Text>
              </View>
              {/* End Date */}
              <View style={styles.dateFieldBox}>
                <View style={styles.dateFieldInner}>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                  <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dateFieldLabel}>End date</Text>
              </View>
            </View>
            {/* Date Pickers */}
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
            {/* Quick Date Range Presets */}
            <View style={styles.presetContainer}>
              <View style={styles.presetButtons}>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => quickSelectPreset(7)}>
                  <Text style={styles.presetButtonText}>Last 7 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => quickSelectPreset(30)}>
                  <Text style={styles.presetButtonText}>Last 30 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => quickSelectPreset(90)}>
                  <Text style={styles.presetButtonText}>Last 90 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => quickSelectPreset('year')}>
                  <Text style={styles.presetButtonText}>This Year</Text>
                </TouchableOpacity>
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
        </View>
      </ScrollView>
    </LayoutAdmin>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#11493f', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#11493f', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#ffd66b' },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#11493f', marginBottom: 8 },
  hint: { fontSize: 13, color: '#666', marginBottom: 12, fontStyle: 'italic' },
  pickerWrapper: { borderWidth: 2, borderColor: '#11493f', borderRadius: 8, backgroundColor: '#f7f1de', overflow: 'hidden' },
  picker: { height: 50, color: '#11493f' },

  dateRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  dateFieldBox: {
    flex: 1,
    backgroundColor: '#f7f1de',
    borderWidth: 2,
    borderColor: '#11493f',
    borderRadius: 8,
    marginRight: 8,
    padding: 8,
    alignItems: 'flex-start',
    minWidth: 120,
  },
  dateFieldInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  dateValue: {
    fontSize: 17,
    color: '#11493f',
    fontWeight: '600',
    paddingRight: 10,
  },
  calendarIcon: {
    fontSize: 22,
    paddingLeft: 8,
  },
  dateFieldLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },

  reportInfo: { backgroundColor: '#f0f8ff', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#11493f' },
  reportInfoTitle: { fontSize: 14, fontWeight: '700', color: '#11493f', marginBottom: 8 },
  reportInfoText: { fontSize: 13, color: '#11493f', marginBottom: 4 },
  reportInfoBold: { fontWeight: '700' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  button: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  previewButton: { backgroundColor: '#11493f' },
  downloadButton: { backgroundColor: '#d32f2f' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statusCard: { backgroundColor: '#fff3cd', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#856404', marginBottom: 8 },
  statusText: { fontSize: 13, color: '#856404', marginBottom: 4 },
  presetContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#ddd' },
  presetLabel: { fontSize: 13, fontWeight: '600', color: '#11493f', marginBottom: 8 },
  presetButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetButton: { backgroundColor: '#11493f', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 4, marginBottom: 4 },
  presetButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});