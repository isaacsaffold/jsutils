/* An unbounded cyclic queue. */
export class Queue
{
    /*
     * Parameters
     * ----------
     * arg: number | Iterable<any> - If `arg` is of type `number`, an empty queue is created with an initial capacity of
     *     `arg`, which must be a positive integer. If `arg` is iterable, the queue will consist of the elements of
     *     `arg`, with its first element at the front.
     */
    constructor(arg)
    {
        if (arg instanceof Object && Symbol.iterator in arg)
        {
            this._array = Array.from(arg);
            this._size = this._array.length;
            this._backIndex = this._size - 1;
        }
        else
        {
            let capacity = typeof arg === "number" ? arg : 8;
            this._array = new Array(capacity);
            this._size = this._backIndex = 0;
        }
        this._frontIndex = 0;
    }

    /*
     * size - returns the number of elements in the queue
     * front - returns the element next in line to be popped, or `undefined` if the queue is empty
     * back - returns the element most recently pushed, or `undefined` if the queue is empty
     *
     * Each of these take O(1) time.
     */
    get size() {return this._size;}
    get front() {return this._size ? this._array[this._frontIndex] : undefined;}
    get back() {return this._size ? this._array[this._backIndex] : undefined;}

    _at(index)
    {
        let i = (this._frontIndex + index) % this._array.length;
        return this._array[i];
    }

    _expand()
    {
        let oldLength = this._array.length;
        this._array.length *= 2;
        if (this._backIndex < this._frontIndex)
        {
            if (oldLength - this._frontIndex > this.backIndex + 1)
            {
                this._array.copyWithin(this._frontIndex + oldLength, this._frontIndex, oldLength);
                this._frontIndex += oldLength;
            }
            else
            {
                this._array.copyWithin(oldLength, 0, this._backIndex + 1);
                this._backIndex += oldLength;
            }
        }
    }

    [Symbol.iterator]()
    {
        let i = 0;
        let queue = this;
        let iter =
        {
            next()
            {
                let obj =
                {
                    done: i >= queue._size,
                    value: queue._at(i),
                };
                ++i;
                return obj;
            }
        };
        return iter;
    }

    /*
     * Returns the element at position `index` in the queue, or `undefined` if `index` is out of bounds.
     *
     * Takes O(1) time.
     */
    at(index)
    {
        return index >= 0 && index < this._size ? this._at(index) : undefined;
    }

    /*
     * Places `item` at the back of the queue, expanding if the new queue size would exceed its current capacity.
     *
     * Takes amortized O(1) time.
     */
    push(item)
    {
        if (this._size === 0)
            this._array[this._backIndex] = item;
        else
        {
            if (this._size === this._array.length)
                this._expand();
            this._backIndex = (this._backIndex + 1) % this._array.length;
            this._array[this._backIndex] = item;
        }
        ++this._size;
    }

    /*
     * Removes the element at the front of the queue and returns it, or `undefined` if the queue is empty.
     *
     * Takes O(1) time.
     */
    pop()
    {
        if (this._size)
        {
            let prevFront = this._array[this._frontIndex];
            if (this._size > 1)
                this._frontIndex = (this._frontIndex + 1) % this._array.length;
            --this._size;
            return prevFront;
        }
        else
            return undefined;
    }

    /*
     * Removes the item at the corresponding position in the queue and returns it, or `undefined` if `index` is out of
     * bounds.
     *
     * Takes time proportional to `index`, which is O(n) in the worst case, `n` being the queue's size.
     */
    remove(index)
    {
        let item = this.at(index);
        if (item === undefined)
            return undefined;
        if (this._size > 1)
        {
            let i = (this._frontIndex + index) % this._array.length;
            if (this._backIndex >= this._frontIndex)
            {
                if (i < (this._frontIndex + this._backIndex) / 2)
                {
                    this._array.copyWithin(this._frontIndex + 1, this._frontIndex, i);
                    ++this._frontIndex;
                }
                else
                {
                    this._array.copyWithin(i, i + 1, this._backIndex + 1);
                    --this._backIndex;
                }
            }
            else if (i >= this._frontIndex)
            {
                this._array.copyWithin(this._frontIndex + 1, this._frontIndex, i);
                ++this._frontIndex;
            }
            else
            {
                this._array.copyWithin(i, i + 1, this._backIndex + 1);
                --this._backIndex;
            }
        }
        --this._size;
        return item;
    }
    
    /*
     * Removes all items from the queue.
     *
     * Takes O(1) time.
     */
    clear()
    {
        this._frontIndex = this._backIndex = this._size = 0;
    }
}

/*
 * Extends the functionality of `Queue` to allow constant-time lookup of a given element's queue position.
 *
 * Unless explicitly stated otherwise, its functions (including the constructor) can be assumed to behave identically
 * to those of `Queue`.
 *
 * The elements in a `TrackerQueue` must be distinct, as determined by the "sameValueZero" algorithm. Visit
 * "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Same-value-zero_equality"
 * for a description of this algorithm.
 *
 * A hash table is used internally, and thus the worst case time complexity of operations that are O(f(n)) on average
 * are often O(nf(n)) in the worst case, where `n` is the size of the queue. However, the worst case is so rare that it
 * need not be taken into account in most cases.
 */
export class TrackerQueue extends Queue
{
    /*
     * Parameters
     * ----------
     * key?: (QueueElement) => any - May increase performance when elements are complex objects. Must be a bijection
     *     from the set of possible elements to the set of possible element keys.
     */
    constructor(arg, key = (x) => x)
    {
        super(arg);
        this._tracker = new Map();
        this._key = key;
        for (let i = 0; i < this._size; ++i)
            this._tracker.set(key(this._array[i]), i);
    }

    _expand()
    {
        super._expand();
        for (let i = 0; i < this._size; ++i)
            this._tracker.set(this._key(this._array[i]), i);
    }

    push(item)
    {
        super.push(item);
        this._tracker.set(this._key(item), this._backIndex);
    }

    pop()
    {
        let popped = super.pop();
        if (popped !== undefined)
            this._tracker.delete(this._key(popped));
        return popped;
    }

    remove(index)
    {
        let item = super.remove(index);
        if (item !== undefined)
        {
            this._tracker.delete(this._key(item));
            for (let i = 0; i < index; ++i)
            {
                let k = (this._frontIndex + i) % this._array.length;
                this._tracker.set(this._key(this._array[k]), k);
            }
        }
        return item;
    }

    /*
     * If `item` is contained in the queue, it is removed and `true` is returned. Otherwise, `false` is returned.
     *
     * Takes the same amount of time as `remove` on average.
     */
    removeItem(item)
    {
        return this.remove(this.position(item)) !== undefined;
    }

    /*
     * Returns `item`'s position in the queue, or `-1` if it is not contained in the queue.
     *
     * Takes O(1) time on average.
     */
    position(item)
    {
        let queueIndex = this._tracker.get(this._key(item));
        if (queueIndex !== undefined)
        {
            let n = queueIndex - this._frontIndex;
            return n >= 0 ? n : this._size + n;
        }
        else
            return -1;
    }
    
    /*
     * Takes the same amount of time as `Map.prototype.clear`, for a `Map` that has as many elements as are in this
     * queue.
     */
    clear()
    {
        super.clear();
        this._tracker.clear();
    }
}
