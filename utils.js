function identity(x) {return x;}

/*
 * An implementation of the binary search algorithm, extended to allow "rounding".
 *
 * When `op` equals '==', the index of `val`'s location in `seq` is returned, or -1 if `val` is not contained in `seq`.
 * When `op` equals '<=' or '>=', if `val` is contained in `seq`, the index of its location is returned. If not, the index
 * of the greatest element of `seq` less than `val`, or the least element of `seq` greater than `val`, respectively, is
 * returned. In this case, the return value may equal -1 or `seq.length` if it is less than or greater than every element
 * in `seq`.
 *
 * `seq` must be indexable for this function to work properly.
 */
export function binarySearch(seq, val, op = '==', key = identity)
{
	var start = 0, stop = seq.length;
	while (stop - start > 0)
	{
		var mid = Math.trunc((start + stop) / 2);
		if (val == key(seq[mid]))
			return mid;
		else if (val < key(seq[mid]))
			stop = mid;
		else
			start = mid + 1;
	}
	switch (op)
	{
		case '==':
			return -1;
		case '<=':
			return key(seq[mid]) < val ? mid : mid - 1;
		case '>=':
			return key(seq[mid]) > val ? mid : mid + 1;
		default:
			throw new Error(`'${op}' is not a valid operator.`);
	}
}

/*
 * Returns a shallow copy of the portion of `seq` that begins with an element greater than or equal to `low` and ends
 * with an element less than or equal to `high`.
 *
 * `seq` must be an indexable collection consisting of unique elements for this function to work properly.
 */
export function binSlice(seq, low, high, key = identity)
{
	const start = binarySearch(seq, low, '>=', key);
	const stop = binarySearch(seq, high, '<=', key) + 1;
	if ("slice" in seq && typeof(seq.slice) === "function")
		return seq.slice(start, stop);
	else
		return Array.from(seq).slice(start, stop);
}

function implDeepFreeze(object, doNotFreeze)
{
    // `doNotFreeze` contains objects that are either down the call stack (circular references) or have already been
    // deep-frozen.
    doNotFreeze.add(object);
    for (let propName of Object.getOwnPropertyNames(object).concat(Object.getOwnPropertySymbols(object)))
    {
        let prop = object[propName];
        if (prop instanceof Object && !doNotFreeze.has(prop))
            implDeepFreeze(prop, doNotFreeze);
    }
    Object.freeze(object);
}

/* Calls `Object.freeze` on an object, as well as every other object reachable from it. */
export function deepFreeze(object)
{
    implDeepFreeze(object, new Set());
    return object;
}

/*
 * Yields the elements of an iterable for which a given predicate is true.
 *
 * Similar to `Array.prototype.filter`, but for an arbitrary iterable.
 */
export function* filter(iterable, predicate)
{
    if (!iterable)
        return;
    for (let x of iterable)
    {
        if (predicate(x))
            yield x;
    }
}

/* Yields the first `n` elements of an iterable. */
export function* iterFirstN(iterable, n)
{
    if (!iterable)
        return;
    let i = 0;
    for (let x of iterable)
    {
        if (++i > n)
            break;
        yield x;
    }
}

export function toTitleCase(str)
{
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}
