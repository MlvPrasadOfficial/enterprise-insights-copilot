import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("eval_summary")

try:
    df = pd.read_csv("logs/eval_results.csv")
    logger.info(f"Total tests: {len(df)}")
    logger.info(f"Pass rate: {round((df['score'] == 'pass').mean() * 100, 2)}%")
    logger.info("\nWin counts:")
    logger.info(df["winner"].value_counts())
except Exception as e:
    logger.error(f"Exception in eval_summary: {e}")
    raise
