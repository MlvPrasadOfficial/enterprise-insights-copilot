import pandas as pd
df = pd.read_csv("logs/eval_results.csv")

print(f"Total tests: {len(df)}")
print(f"Pass rate: {round((df['score'] == 'pass').mean() * 100, 2)}%")

print("\nWin counts:")
print(df["winner"].value_counts())
