import React, { createContext, useState, useCallback, useEffect } from 'react';
import { createClusteredGrid, computeNextGenerationWithAges } from '../utils/gameLogic';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [grid, setGrid] = useState(createClusteredGrid(20, 20, 5, 3));
    const [isPlaying, setIsPlaying] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [gridSize, setGridSize] = useState({ rows: 20, cols: 20 });
    const [cellAges, setCellAges] = useState(createInitialCellAges(20, 20));
    const [useHeatmap, setUseHeatmap] = useState(false);


    // Initialize cell ages with 0 (dead cells) 
    function createInitialCellAges(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 0)
        );
    }

    // Function to update the grid size
    const updateGridSize = useCallback((rows, cols) => {
        setGridSize({ rows, cols });
        setGrid(createClusteredGrid(rows, cols));
        setGeneration(0);
        setIsPlaying(false);
    }, []);

    // Function to toggle the cell state
    const toggleCellState = (rowIndex, colIndex) => {
        setGrid(currentGrid => {
            const newGrid = [...currentGrid];
            newGrid[rowIndex][colIndex] = currentGrid[rowIndex][colIndex] ? 0 : 1;
            return newGrid;
        });
    };

    // Function to reset the game to the initial state
    const resetGame = () => {
        setGrid(createClusteredGrid(gridSize.rows, gridSize.cols, 5, 3));
        setCellAges(createInitialCellAges(gridSize.rows, gridSize.cols)); 
        setGeneration(0);
        setIsPlaying(false);
    };

    // Updated function to compute the next generation and update cell ages
    const goToNextGeneration = useCallback(() => {
        const { nextGrid, nextCellAges } = computeNextGenerationWithAges(grid, cellAges);
        setGrid(nextGrid);
        setCellAges(nextCellAges);
        setGeneration(gen => gen + 1);
    }, [grid, cellAges]);

    // This effect will start the autoplay when isPlaying is true and stop it when isPlaying is false
    useEffect(() => {
        let interval;

        if (isPlaying) {
            interval = setInterval(goToNextGeneration, 100);
        }

        return () => clearInterval(interval);
    }, [isPlaying, goToNextGeneration]);


    return (
        <GameContext.Provider
            value={{
                grid,
                setGrid,
                cellAges,
                useHeatmap, 
                setUseHeatmap,
                isPlaying,
                setIsPlaying,
                generation,
                gridSize,
                updateGridSize,
                toggleCellState,
                resetGame,
                goToNextGeneration
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;
