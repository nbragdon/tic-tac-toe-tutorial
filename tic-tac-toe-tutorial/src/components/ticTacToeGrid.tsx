import React from "react";
import { Button, Table, TableBody, TableRow, TableCell, TableHead } from '@cmsgov/design-system';
import { prependListener } from "process";

const BOARD_SIZE = 9;
const BOARD_ROWS = 3;
const BOARD_COLUMNS = 3;

type Squares = (string | null)[]

function calculateWinner(squares: Squares) {
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
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

type SquareProps = {
    value: string | null,
    onClick: Function
}

function Square(props: SquareProps) {
    return (
        <Button onClick={() => props.onClick()}>
            {props.value || ''}
        </Button>
    );
}

type BoardProps = {
    squares: Squares,
    onClick: Function
}

function Board(props: BoardProps) {
    const squares = props.squares;

    const renderSquare = (index: number) => {
        return <Square value={squares[index]} onClick={() => props.onClick(index)} />;
    }

    return (
        <div>
            <section className="ds-l-container">
                <div className="ds-l-row">
                    <div className="ds-l-col">
                        {renderSquare(0)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(1)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(2)}
                    </div>
                </div>
                <div className="ds-l-row">
                    <div className="ds-l-col">
                        {renderSquare(3)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(4)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(5)}
                    </div>
                </div>
                <div className="ds-l-row">
                    <div className="ds-l-col">
                        {renderSquare(6)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(7)}
                    </div>
                    <div className="ds-l-col">
                        {renderSquare(8)}
                    </div>
                </div>
            </section>
        </div>
    );
}

type History = {
    squares: (string | null)[],
}[]

export default function Game() {
    const [history, setHistory] = React.useState<History>([{ squares: Array(BOARD_SIZE).fill(null) }]);
    const [nextIndicator, setNextIndicator] = React.useState<string>('X');
    const [stepNumber, setStepNumber] = React.useState<number>(0);
    const squares = history[stepNumber].squares;
    let status = `Next player: ${nextIndicator}`;
    const winner = calculateWinner(squares);

    const switchIndicator = (updatedStepNumber: number) => {
        setNextIndicator((updatedStepNumber % 2) === 0 ? 'X' : 'O');
    }

    const handleClick = (index: number) => {
        if (winner || squares[index]) {
            return;
        }

        const squaresCopy = [...squares];
        squaresCopy[index] = nextIndicator;
        setStepNumber(stepNumber + 1);
        switchIndicator(stepNumber + 1);
        setHistory([
            ...history,
            { squares: squaresCopy }
        ]);
    }

    const jumpTo = (move: number) => {
        setHistory(history.slice(0, move + 1));
        setStepNumber(move);
        switchIndicator(move)
    }

    const moves = history.map((historyItem, move) => {
        const desc = move ? move : 'Start';
        const previousHistoryItem = history[move - 1];
        let moveIndex;

        if (previousHistoryItem) {
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (previousHistoryItem.squares[i] !== historyItem.squares[i]) {
                    moveIndex = i;
                    break;
                }
            }
        } else {
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (historyItem.squares[i] != null) {
                    moveIndex = i;
                    break;
                }
            }
        }

        const rowIndex = typeof moveIndex === 'number' ? Math.floor(moveIndex / BOARD_COLUMNS) : '';
        const colIndex = typeof moveIndex === 'number' ? moveIndex % BOARD_ROWS : '';
        const locationDisplay = typeof moveIndex === 'number' ? `(${rowIndex}, ${colIndex})` : '';
        const playerSymbol = typeof moveIndex === 'number' ? historyItem.squares[moveIndex] : '';

        return (
            <TableRow key={move}>
                <TableCell>{locationDisplay}</TableCell>
                <TableCell>{playerSymbol}</TableCell>
                <TableCell><Button onClick={() => jumpTo(move)}>{desc}</Button></TableCell>
            </TableRow>
        );
    });

    if (winner) {
        status = `Winner: ${winner}`
    }

    return (
        <div className="ds-u-display--flex ds-u-flex-direction--row">
            <div className="game-board">
                <Board squares={squares} onClick={handleClick} />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <Table borderless>
                    <TableHead>
                        <TableRow>
                            <TableCell>Move Location</TableCell>
                            <TableCell>Player Symbol</TableCell>
                            <TableCell>Return</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {moves}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}