const Chart = {
	1: [7],
	2: [6, 12],
	3: [4, 8, 12],
	4: [3, 6, 9, 12],
	5: [3, 5, 8, 10, 12],
	6: [2, 4, 6, 8, 10, 12],
	7: [2, 4, 6, 7, 9, 11, 12],
	8: [2, 3, 5, 6, 8, 9, 11, 12],
	9: [2, 3, 4, 6, 7, 8, 10, 11, 12],
	10: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
	11: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

function Segments(spd: number): Array<number> {
	if (spd < 1) {
		return []
	}

	if (spd > 12) {
		spd = 12
	}

	return Chart[spd]
}

/**
 * Sort Initiatives by Segment, SPD, and DEX
 *
 * Segment is sorted 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
 * SPD and DEX is sorted descending
 *
 * @param {any} a
 * @param {any} b
 *
 * @return {number}
 */
function SortInitiatives(a, b): number {
	// Segments
	if (a.segment === 12 && b.segment !== 12) {
		return -1
	}

	if (b.segment === 12 && a.segment !== 12) {
		return 1
	}

	if (a.segment === b.segment) {
		// DEX
		if (a.dex < b.dex) {
			return 1
		}

		if (a.dex > b.dex) {
			return -1
		}
	}

	if (a.segment < b.segment) {
		return -1
	}

	if (a.segment > b.segment) {
		return 1
	}

	// SPD
	if (a.spd < b.spd) {
		return 1
	}

	if (a.spd > b.spd) {
		return -1
	}

	// DEX
	if (a.dex < b.dex) {
		return 1
	}

	if (a.dex > b.dex) {
		return -1
	}

	return 0
}

export const Speed = {
	Segments,
	SortInitiatives,
}
