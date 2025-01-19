import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatisticsPanel = ({ statistics }) => {
  const {
    winTrades,
    winPercentage,
    capitalFinal,
    winProfit,
    ratio,
    eventsWin,
    eventsLose,
  } = statistics;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.label}>Win Trades</Text>
            <Text style={styles.value}>{winTrades}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Win Percentage</Text>
            <Text style={styles.value}>{winPercentage}%</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.winning]}>
        <Text style={styles.sectionTitle}>Winning</Text>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.label}>Capital Final</Text>
            <Text style={styles.value}>${capitalFinal}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Win Profit</Text>
            <Text style={styles.value}>${winProfit}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.label}>Ratio</Text>
            <Text style={styles.value}>{ratio}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sequence</Text>
        <View style={styles.row}>
          <View style={[styles.cell, styles.winCell]}>
            <Text style={styles.label}>Events Win</Text>
            <Text style={styles.value}>{eventsWin}</Text>
          </View>
          <View style={[styles.cell, styles.loseCell]}>
            <Text style={styles.label}>Events Lose</Text>
            <Text style={styles.value}>{eventsLose}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  winning: {
    backgroundColor: '#FFF9C4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    marginHorizontal: 4,
  },
  winCell: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 4,
  },
  loseCell: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StatisticsPanel;
