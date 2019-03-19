import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text as RNText } from 'react-native';
import { Svg, Circle, Path, Defs, Text, TextPath } from 'react-native-svg';
import Dialog from 'react-native-dialog';

import machineToGrid from './utils/machineToGrid';
import scaleGridToScreen from './utils/scaleGridToScreen';
import linePath from './utils/linePath';
import { isAfjd, toAfd } from './utils/machineTransforms';
import * as StructUtils from './utils/struct';

const { height, width } = Dimensions.get('window');
const INITIAL_ID = 'q0';
const MODES = {
  addState: 'ADD STATE',
  removeState: 'REMOVE STATE',
  addLine: 'ADD LINE',
  removeLine: 'REMOVE LINE'
};

export default class App extends Component {
  state = {
    machine: {
      q0: { a: ['q0', 'q1'], b: ['q0'], c: ['q3'] },
      q1: { b: ['q2'] },
      q2: {},
      q3: {}
    },
    machineEnds: ['q2'],

    // editing
    mode: MODES.addState,
    modal: false,
    name: '',
    from: '',
    to: '',
    key: '',
    error: ''
  };

  resetFields = (preservedFields = {}, after) => {
    this.setState(
      {
        ...preservedFields,
        modal: false,
        name: '',
        from: '',
        to: '',
        key: '',
        error: ''
      },
      after
    );
  };

  handleSubmit = lines => {
    const { machine, mode, name, from, to, key } = this.state;
    let result = null;

    switch (mode) {
      case MODES.addState:
        result = StructUtils.addState(machine, name, from, key);
        break;
      case MODES.removeState:
        result = StructUtils.removeState(machine, name, lines, INITIAL_ID);
        break;
      case MODES.addLine:
        result = StructUtils.addLine(machine, from, to, key);
        break;
      case MODES.removeLine:
        result = StructUtils.removeLine(machine, from, to, key, lines, INITIAL_ID);
        break;
      default:
    }

    console.log(result);

    if (result.error) {
      this.setState({ error: result.error });
    } else {
      this.resetFields(
        {
          machine: { [INITIAL_ID]: {} }
        },
        () => this.setState({ machine: result.machine })
      );
    }
  };

  transformMachine = () => {
    const { afdMachine, machineEnds } = toAfd(
      this.state.machine,
      INITIAL_ID,
      this.state.machineEnds
    );

    this.setState({ machine: { [INITIAL_ID]: {} } }, () =>
      this.setState({ machine: afdMachine, machineEnds })
    );
  };

  renderLines(lines, coordinates, radius) {
    return lines.map((line, index) => {
      const path = linePath(line, coordinates[line.start], coordinates[line.end], radius);
      const curveColor = coordinates[line.start].x > coordinates[line.end].x ? 'red' : 'green';

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
    const { machine, mode, modal, name, from, to, key, error } = this.state;
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
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => this.setState({ mode: MODES.addState, modal: true })}
          >
            <RNText>O</RNText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topButton}
            onPress={() => this.setState({ mode: MODES.addLine, modal: true })}
          >
            <RNText>/</RNText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topButton, { backgroundColor: 'red' }]}
            onPress={() => this.setState({ mode: MODES.removeState, modal: true })}
          >
            <RNText>xO</RNText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topButton, { backgroundColor: 'red' }]}
            onPress={() => this.setState({ mode: MODES.removeLine, modal: true })}
          >
            <RNText>x/</RNText>
          </TouchableOpacity>
        </View>

        <Dialog.Container visible={modal}>
          <Dialog.Title>{mode}</Dialog.Title>

          {(mode === MODES.addState || mode === MODES.removeState) && (
            <Dialog.Input
              placeholder="name"
              value={name}
              onChangeText={val => this.setState({ name: val })}
              autoCapitalize="none"
            />
          )}
          {mode !== MODES.removeState && (
            <Dialog.Input
              placeholder="from"
              value={from}
              onChangeText={val => this.setState({ from: val })}
              autoCapitalize="none"
            />
          )}
          {(mode === MODES.addLine || mode === MODES.removeLine) && (
            <Dialog.Input
              placeholder="to"
              value={to}
              onChangeText={val => this.setState({ to: val })}
              autoCapitalize="none"
            />
          )}
          {mode !== MODES.removeState && (
            <Dialog.Input
              placeholder="key"
              value={key}
              onChangeText={val => this.setState({ key: val })}
              autoCapitalize="none"
            />
          )}

          <Dialog.Description style={{ color: 'red' }}>{error}</Dialog.Description>

          <Dialog.Button label="Cancel" onPress={this.resetFields} />
          <Dialog.Button label="Submit" onPress={() => this.handleSubmit(lines)} />
        </Dialog.Container>

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
