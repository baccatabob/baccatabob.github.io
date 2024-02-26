namespace Nim
{
    public class ScoredMove(int nextState)
    {
        public int NextState { get; set; } = nextState;
        public int FutureWinsCount { get; set; } = 0;
        public int FutureLossesCount { get; set; } = 0;
    }
}
