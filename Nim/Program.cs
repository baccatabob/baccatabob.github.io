using Nim;

// Start with the board with all pieces on, giving a run of 5, a run of 4 and a run of 3
Dictionary<int, State> states = new() { { 0, new State([1, 1, 1, 0, 0]) } };
List<int> toDoList = [0];
List<List<int>> games = [];
Dictionary<int, List<ScoredMove>> scoredMoves = [];

State? GetNextStateToProcess()
{
    int bestPositionInToDoList = -1;
    int scoreOfNextStateToProcess = -1;

    if (toDoList.Count == 0) { return null; }

    for (int i = 0; i < toDoList.Count; i++)
    {
        int scoreOfNextCandidate = states[toDoList[i]].GetHashCode();

        if (scoreOfNextCandidate > scoreOfNextStateToProcess)
        {
            bestPositionInToDoList = i;
            scoreOfNextStateToProcess = scoreOfNextCandidate;
        }
    }

    State result = states[toDoList[bestPositionInToDoList]];
    toDoList.RemoveAt(bestPositionInToDoList);

    return result;
}

State? ProduceNextCandidateState(Rule rule, State state)
{
    if (state.Runs[rule.RunToReduce] == 0) { return null; }

    State nextState = new((int[])state.Runs.Clone());

    nextState.Runs[rule.RunToReduce]--;

    for(int i=0; i<5; i++)
    {
        nextState.Runs[i] += rule.RunsToIncrease[i];
    }

    // the losing i.e. end state is the state with a single piece remaining, so don't bother with the state with no pieces at all
    if (nextState.Runs.Sum() == 0) { return null; }

    return nextState;
}

void WriteSimpleTextOutput()
{
    Console.WriteLine("\n\n");

    Console.WriteLine("\nStates");
    foreach ((int stateIndex, State state) in states)
    {
        Console.WriteLine($"{stateIndex:D3} {state}");
    }
}

void WriteGraphVizOutput()
{
    using (StreamWriter outputFile = new("NimStateConnections.gv"))
    {
        outputFile.WriteLine("digraph G {");

        foreach ((int stateIndex, State state) in states)
        {
            outputFile.WriteLine($"{stateIndex} [label=\"{string.Join("", state.Runs)}\"]");
        }

        outputFile.WriteLine("\n\n");

        foreach ((int stateIndex, State state) in states)
        {
            foreach (int nextState in state.NextStates)
            {
                outputFile.WriteLine($"{stateIndex} -> {nextState}");
            }
        }

        outputFile.WriteLine("}");
    }
}

void WriteConnectionsTable()
{
    int[] sortedStateIndexes = [.. states.Keys];

    // sort them in descending order
    Array.Sort(sortedStateIndexes, (int indexA, int indexB) => { return -1 * states[indexA].CompareTo(states[indexB]); });

    string headerRow = "," + string.Join(",", sortedStateIndexes.Select(x => states[x].Label()));

    using (StreamWriter outputFile = new("NimStateConnections.csv"))
    {
        outputFile.WriteLine(headerRow);

        foreach (int stateIndex in sortedStateIndexes)
        {
            State currentState = states[stateIndex];
            string rowForState = currentState.Label() + string.Join("", sortedStateIndexes.Select(x => "," + (currentState.NextStates.Contains(x) ? "1" : "")));
            outputFile.WriteLine(rowForState);
        }
    }
}

void BuildGraphOfStates()
{
    /*
    Algorithm
    =========

    Initialise list of states with state 0 = 11100, and to do list with state 0		

    While to do list not empty		
        Take the biggest state off the to do list	
        Loop through all rules	
            Apply rule to current state to get candidate next state
            If candidate next state is invalid, continue to next rule
            If candidate next state doesn't exist, add to list of states and to do list
            Add candidate next state to list of next states for the current state
    */

    while (toDoList.Count > 0)
    {
        State? currentState = GetNextStateToProcess();

        if (currentState == null) { break; }

        Console.WriteLine($"To do list size:{toDoList.Count}, number of states: {states.Count}, current state = {currentState}");

        foreach (Rule rule in Rules.rules)
        {
            State? nextCandidateState = ProduceNextCandidateState(rule, currentState);

            if (nextCandidateState == null) { continue; }

            bool foundExistingState = false;
            foreach ((int stateIndex, State existingState) in states)
            {
                if (existingState.Equals(nextCandidateState))
                {
                    currentState.NextStates.Add(stateIndex);
                    foundExistingState = true;
                    break;
                }
            }

            if (!foundExistingState)
            {
                int newStateIndex = states.Count;
                states.Add(newStateIndex, nextCandidateState);
                currentState.NextStates.Add(newStateIndex);
                toDoList.Add(newStateIndex);
            }
        }
    }
}

void TraverseStateGraph(int state, List<int> path)
{
    List<int> newPath = path.Select(p => p).ToList();
    newPath.Add(state);

    if (states[state].NextStates.Count == 0)
    {
        games.Add(newPath);
        return;
    }

    foreach(int nextState in states[state].NextStates)
    {
        TraverseStateGraph(nextState, newPath);
    }
}

void ScoreMoves()
{
    foreach((int stateIndex, State state) in states)
    {
        List<ScoredMove> moves = state.NextStates.Select(x => new ScoredMove(x)).ToList();
        scoredMoves.Add(stateIndex, moves);
    }

    foreach(List<int> game in games)
    {
        int winCount = game.Count % 2 == 0 ? 1 : 0;
        int lossCount = 1 - winCount;

        int state = game[0], nextState = -1;
        for(int moveInGame=1; moveInGame<game.Count; moveInGame++)
        {
            nextState = game[moveInGame];
            ScoredMove move = scoredMoves[state].Where(x => x.NextState == nextState).First();
            move.FutureLossesCount += lossCount;
            move.FutureWinsCount += winCount;

            state = nextState;
        }
    }
}

void WriteScoredMoves()
{
    Console.WriteLine("\n\nScored moves\n");
    foreach(int state in scoredMoves.Keys)
    {
        string output = $"{state:D3} {string.Join(",", scoredMoves[state].Select(x => $"[{x.NextState:D3} W:{x.FutureWinsCount} L:{x.FutureLossesCount} P:{Math.Round(100.0 * x.FutureWinsCount / (x.FutureWinsCount + x.FutureLossesCount),2)}]"))}";
        Console.WriteLine(output + "\n");
    }
}

BuildGraphOfStates();

WriteSimpleTextOutput();

//WriteGraphVizOutput();

//WriteConnectionsTable();

TraverseStateGraph(0, []);

Console.WriteLine($"\n\nList of possible games has {games.Count} entries");

ScoreMoves();

WriteScoredMoves();