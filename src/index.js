import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

function Square(props) {
    return (
        <button
                style={props.highlight ? {'background-color': '#05f7ff'} : {}}
                className="square"
                height='300px'
                width='300px'
                onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    render() {
        const renderSquare = (i, j) => (
            <Square
                onClick={() => this.props.squareClicked(i, j)}
                value={this.props.rows[i][j]} 
                highlight={this.props.highlights[i][j]} />
        );
        const boardRows = [...Array(3).keys()].map(i => (
            <div className="board-row">
                {[...Array(3).keys()].map(j => renderSquare(i, j))}
            </div>
        ));
        return (
            <div>
                {boardRows}
            </div>
        );
    }
}

const Move = (props) => (
    <ListItem button component="a" {...props} />
);

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            next: 'X',
            highlights: Array(3).fill(Array(3).fill(false)),
            history: [Array(3).fill(Array(3).fill(null))],
            step: 0,
        };
    }

    clear() {
        this.setState((state) => ({
            ...state,
            highlights: Array(3).fill(Array(3).fill(false)),
            history: [Array(3).fill(Array(3).fill(null))],
            step: 0,
        }));
    }

    winner(rows) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        const cells = rows.reduce((acc, row) => [...acc, ...row]);
        for (const [a, b, c] of lines) {
            if (cells[a] == null) {
                continue;
            }
            if (cells[a] === cells[b] && cells[a] === cells[c]) {
                // flag the winning cells for highlighting in rows
                // corresponding to our state grid
                const highlights = Array(9).fill(false);
                const grid = []
                for (let i of [a, b, c]) {
                    highlights[i] = true;
                }
                while (highlights.length > 0) {
                    grid.push(highlights.splice(0, 3))
                }
                this.setState(state => ({...state, highlights: grid}));
                return cells[a]
            }
        }
        return null;
    }

    squareClicked(i, j) {
        const history = this.state.history;
        const move = this.state.step;
        const rows = [...history[move].map(row => [...row])]
        if (rows[i][j] != null && move === history.length-1) {
            alert('cell already marked this round.');
            return;
        }
        rows[i][j] = this.state.next;
        const winner = this.winner(rows);
        this.setState((state) => ({
            ...state,
            next: state.next === 'O' ? 'X' : 'O',
            history: [...state.history.splice(0, state.step+1), rows],
            step: state.step+1,
        }));
        if (winner != null) {
            new Promise(resolve => setTimeout(resolve, 200)).then(() => {
                alert(`${winner} won!`);
                this.clear();
            });
            return;
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (rows[i][j] == null) {
                    return;
                }
            }
        }
        alert("no slots left ― it's a tie!");
        this.clear();
    }

    jumpTo(step) {
        this.setState((state) => ({
            ...state,
            step: step,
            next: step % 2 === 0 ? 'X' : 'O',
        }));
    }

    render() {
        const state = `Next player: ${this.state.next}`;
        const history = this.state.history;
        const moves = [...Array(history.length).keys()].map(i => (
            <Move onClick={() => this.jumpTo(i)}>
                {i === 0 ? 'Start' : `Move ${i}`}
            </Move>
        ));
        return (
            <div className="game">
                <div className="game-board">
                    <Board squareClicked={(i, j) => this.squareClicked(i, j)}
                           highlights={this.state.highlights}
                           rows={history[this.state.step]} />
                </div>
                <div className="game-info">
                    <div>{state}</div>
                    <List>{moves}</List>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
