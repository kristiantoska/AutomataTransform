import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text as RNText } from 'react-native';
import { Svg, Circle, Path, Defs, Text, TextPath } from 'react-native-svg';

import machineToGrid from './utils/machineToGrid';
import scaleGridToScreen from './utils/scaleGridToScreen';
import linePath from './utils/linePath';
import { isAfjd, toAfd } from './utils/machineTransforms';

const { height, width } = Dimensions.get('window');
const INITIAL_ID = 'q0';

export default class App extends Component {
  state = {
    machine: {
      q0: { a: ['q0', 'q1'], b: ['q0'], c: ['q3'] },
      q1: { b: ['q2'] },
      q2: {},
      q3: {}
    },
    machineEnds: ['q2'],
    mode: null
  };
  nextId = 4;
  selectedStates = [];

  addState = () => {
    this.setState({ mode: 'add' });
  };

  transformMachine = () => {
    const { afdMachine, machineEnds } = toAfd(
      this.state.machine,
      INITIAL_ID,
      this.state.machineEnds
    );

    this.setState({ machine: { q0: {} } }, () =>
      this.setState({ machine: afdMachine, machineEnds })
    );
  };

  renderLines(lines, coordinates, radius) {
    return lines.map((line, index) => {
      const path = linePath(line, coordinates[line.start], coordinates[line.end], radius);
      const curveColor = line.start > line.end ? 'red' : 'green';

      return (
        <React.Fragment key={index}>
          <Defs>
            <Path id={`path${index}`} d={path} />
          </Defs>

          <Text fill="blue" fontSize="14" textAnchor="middle" y="-3">
            <TextPath href={`#path${index}`} startOffset="50%">
              {line.keys.join(',')} >
            </TextPath>
          </Text>

          <Path d={path} stroke={curveColor} fill="transparent" />
        </React.Fragment>
      );
    });
  }

  renderStates(grid, coordinates, radius) {
    const { machineEnds } = this.state;

    return grid.map((column, columnIndex) =>
      column.map((stateId, cellIndex) => (
        <React.Fragment key={`${columnIndex} - ${cellIndex}`}>
          <Circle
            cx={coordinates[stateId].x}
            cy={coordinates[stateId].y}
            r={radius}
            fill={machineEnds.indexOf(stateId) !== -1 ? 'lightgreen' : 'white'}
            stroke="black"
          />

          <Text
            fill="black"
            textAnchor="middle"
            x={coordinates[stateId].x}
            y={coordinates[stateId].y + 5}
          >
            {stateId}
          </Text>
        </React.Fragment>
      ))
    );
  }

  render() {
    const { machine, mode } = this.state;
    const canTransform = isAfjd(machine);

    const { grid, lines } = machineToGrid(machine, INITIAL_ID);
    const { coordinates, radius } = scaleGridToScreen(grid, height, width);

    return (
      <View style={styles.container}>
        <Svg height={height} width={width}>
          {this.renderLines(lines, coordinates, radius)}
          {this.renderStates(grid, coordinates, radius)}
        </Svg>

        <View style={styles.topButtonRow}>
          <TouchableOpacity onPress={this.addState} style={styles.topButton}>
            <RNText>O</RNText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.topButton}>
            <RNText>/</RNText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.topButton, { backgroundColor: 'red' }]}>
            <RNText>xO</RNText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.topButton, { backgroundColor: 'red' }]}>
            <RNText>x/</RNText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={this.transformMachine}
          disabled={!canTransform}
          style={[styles.transformButton, { backgroundColor: canTransform ? 'lightgreen' : 'red' }]}
        >
          <RNText>{canTransform ? 'Transform' : 'AFD'}</RNText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },

  topButtonRow: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row'
  },

  topButton: {
    backgroundColor: 'lightgreen',
    padding: 5,
    marginHorizontal: 5
  },

  transformButton: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    padding: 10
  }
});
