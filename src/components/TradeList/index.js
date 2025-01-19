import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const TradeList = ({ trades, onUpdateResult }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trades</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.numberCell]}>N°</Text>
        <Text style={[styles.headerCell, styles.resultCell]}>Result</Text>
        <Text style={[styles.headerCell, styles.amountCell]}>Amount</Text>
        <Text style={[styles.headerCell, styles.returnCell]}>Return</Text>
        <Text style={[styles.headerCell, styles.portfolioCell]}>Portfolio</Text>
      </View>
      <ScrollView>
        {trades.map((trade, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, styles.numberCell]}>{index + 1}</Text>
            <View style={[styles.cell, styles.resultCell]}>
              <View style={styles.resultButtons}>
                <TouchableOpacity
                  style={[
                    styles.resultButton,
                    trade.result === 'win' && styles.resultButtonActive,
                    styles.winButton,
                  ]}
                  onPress={() => onUpdateResult(index, 'win')}
                >
                  <Text style={[
                    styles.resultButtonText,
                    trade.result === 'win' && styles.resultButtonTextActive
                  ]}>Win</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.resultButton,
                    trade.result === 'loss' && styles.resultButtonActive,
                    styles.lossButton,
                  ]}
                  onPress={() => onUpdateResult(index, 'loss')}
                >
                  <Text style={[
                    styles.resultButtonText,
                    trade.result === 'loss' && styles.resultButtonTextActive
                  ]}>Loss</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.cell, styles.amountCell]}>
              ${trade.amount.toFixed(2)}
            </Text>
            <Text style={[styles.cell, styles.returnCell]}>
              {trade.return ? `$${trade.return.toFixed(2)}` : '-'}
            </Text>
            <Text style={[styles.cell, styles.portfolioCell]}>
              {trade.portfolio ? `$${trade.portfolio.toFixed(2)}` : '-'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  numberCell: {
    width: '10%',
  },
  resultCell: {
    width: '30%',
  },
  amountCell: {
    width: '20%',
  },
  returnCell: {
    width: '20%',
  },
  portfolioCell: {
    width: '20%',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  resultButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 4,
  },
  winButton: {
    borderColor: '#4CAF50',
  },
  lossButton: {
    borderColor: '#F44336',
  },
  resultButtonActive: {
    backgroundColor: '#4CAF50',
  },
  resultButtonText: {
    fontSize: 12,
  },
  resultButtonTextActive: {
    color: '#fff',
  },
});

export default TradeList;
