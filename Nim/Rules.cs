namespace Nim
{
    internal static class Rules
    {
        internal static readonly Rule[] rules =
            [
                new Rule(4, [0, 0, 0, 0, 0]),

                new Rule(3, [0, 0, 0, 0, 0]),
                new Rule(3, [0, 0, 0, 0, 1]),
                
                new Rule(2, [0, 0, 0, 0, 0]),
                new Rule(2, [0, 0, 0, 0, 1]),
                new Rule(2, [0, 0, 0, 1, 0]),
                new Rule(2, [0, 0, 0, 0, 2]),
                
                new Rule(1, [0, 0, 0, 0, 0]),
                new Rule(1, [0, 0, 0, 0, 1]),
                new Rule(1, [0, 0, 0, 1, 0]),
                new Rule(1, [0, 0, 0, 0, 2]),
                new Rule(1, [0, 0, 1, 0, 0]),
                new Rule(1, [0, 0, 0, 1, 1]),

                new Rule(0, [0, 0, 0, 0, 0]),
                new Rule(0, [0, 0, 0, 0, 1]),
                new Rule(0, [0, 0, 0, 1, 0]),
                new Rule(0, [0, 0, 0, 0, 2]),
                new Rule(0, [0, 0, 1, 0, 0]),
                new Rule(0, [0, 0, 0, 1, 1]),
                new Rule(0, [0, 1, 0, 0, 0]),
                new Rule(0, [0, 0, 1, 0, 1]),
                new Rule(0, [0, 0, 0, 2, 0])
            ];
    }
}
