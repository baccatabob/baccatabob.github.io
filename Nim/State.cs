namespace Nim
{
    internal class State(int[] runs): IComparable
    {
        //Runs[0] = how many runs of 5 there are, Runs[4] = how many runs of 1 there are
        internal int[] Runs { get; set; } = runs;
        internal List<int> NextStates { get; set; } = [];

        public string Label()
        {
            return string.Join("", Runs);
        }

        public override int GetHashCode()
        {
            // The biggest value in any element is 7 (the max number of runs of 1, the size you can have most of).
            // So interpreting it as an octal number is guaranteed to give a unique hash code.
            return Runs[4] + (Runs[3] * 8) + (Runs[2] * 64) + (Runs[1] * 512) + (Runs[0] * 4096);
        }

        public override bool Equals(object? obj)
        {
            return Equals(obj as State);
        }

        public bool Equals(State? other)
        {
            if (other == null) return false;

            return other.Runs.SequenceEqual(Runs);
        }

        public override string ToString()
        {
            return $"{Label()} -> {string.Join(",", NextStates)}";
        }

        public int CompareTo(object? obj)
        {
            if (obj == null) return 0;

            return CompareTo(obj as State);
        }

        public int CompareTo(State? other)
        {
            if (other == null) return 0;

            return GetHashCode() - other.GetHashCode();
        }
    }
}
