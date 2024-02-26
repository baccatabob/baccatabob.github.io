namespace Nim
{
    internal class Rule(int ToReduce, int[] ToIncrease)
    {
        // 0 => reduce the number of runs of 5, 4 => reduce the number of runs of 1
        internal int RunToReduce { get; set; } = ToReduce;

        // 0 => how many to add to the number of runs of 5, 4 => how many to add to the number of runs of 1
        internal int[] RunsToIncrease { get; set; } = ToIncrease;

        public override string ToString()
        {
            return $"{RunToReduce} {string.Join("", RunsToIncrease)}";
        }
    }
}
