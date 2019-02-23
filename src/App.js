import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text as RNText } from 'react-native';
import { Svg, Circle, Path, Defs, Text, TextPath } from 'react-native-svg';

import machineToGrid from './utils/machineToGrid';
import scaleGridToScreen from './utils/scaleGridToScreen';
import { isAfjd, toAfd } from './utils/machineTransforms';

const { height, width } = Dimensions.get('window');
const INITIAL_ID = 'q0';

export default class App extends Component {
  state = {
    machine: {
      q0: { a: ['q1', 'q2'] },
      q1: { c: ['q3'] },
      q2: {},
      q3: {}
    },
    machineEnds: ['q1']
  };
  nextId = 7;

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

  renderLines(lines, coordinates) {
    return lines.map((line, index) => {
      const start = coordinates[line.start];
      const end = coordinates[line.end];

      const curveShift = {
        x: 0,
        y: 0
      };

      if (coordinates[line.start].x === coordinates[line.end].x) {
        curveShift.x = coordinates[line.start].y < coordinates[line.end].y ? 50 : -50;
      } else {
        curveShift.y = coordinates[line.start].x > coordinates[line.end].x ? 50 : -50;
      }

      const curveColor = line.start > line.end ? 'red' : 'green';

      const path = `
        M${start.x} ${start.y} 
        Q${(start.x + end.x) / 2 + curveShift.x} ${(start.y + end.y) / 2 + curveShift.y} 
        ${end.x} ${end.y}`;

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
    const { machine } = this.state;
    const canTransform = isAfjd(machine);

    const { grid, lines } = machineToGrid(machine, INITIAL_ID);
    const { coordinates, radius } = scaleGridToScreen(grid, height, width);

    return (
      <View style={styles.container}>
        <Svg height={height} width={width}>
          {this.renderLines(lines, coordinates)}
          {this.renderStates(grid, coordinates, radius)}
        </Svg>

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

  transformButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 10
  }
});
