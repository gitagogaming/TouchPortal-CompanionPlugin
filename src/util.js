export function convertXYToIndexForPanel(x, y, gridSize) {
	if (x < 0 || y < 0 || x >= gridSize.columns || y >= gridSize.rows) return null

	return y * gridSize.columns + x
}

/**
 * Convert a surface index to coordinates
 * @param {number} index
 * @param {GridSize} gridSize
 * @returns {[x: number, y: number] | null}
 */
export function convertPanelIndexToXY(index, gridSize) {
	index = Number(index)
	if (isNaN(index) || index < 0 || index >= gridSize.columns * gridSize.rows) return null

	const x = index % gridSize.columns
	const y = Math.floor(index / gridSize.columns)
	return [x, y]
}

/**
 * Rotate a coordinate
 * @param {number} x
 * @param {number} y
 * @param {GridSize} gridSize
 * @param {SurfaceRotation} rotation
 * @returns
 */