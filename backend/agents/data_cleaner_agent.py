"""
DataCleanerAgent: Handles data cleaning, normalization, and preparation for analysis.
"""

import pandas as pd
import re
import numpy as np
from datetime import datetime
from backend.core.logging import logger
from typing import Any, Dict, List, Union, Optional
from backend.agents.base_agent import BaseAgent


class DataCleanerAgent(BaseAgent):
    name = "DataCleanerAgent"
    role = "Cleans and normalizes data for analysis"

    def __init__(self, df: pd.DataFrame, config=None):
        """
        Initialize the DataCleanerAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The data to clean.
            config: Optional configuration
        """
        super().__init__(config)
        self.df = df.copy() if df is not None else pd.DataFrame()
        self.original_df = df.copy() if df is not None else pd.DataFrame()
        self.cleaning_operations = []  # Track operations performed
        self.detailed_results = {}  # Store detailed operation results
        logger.info(f"[{self.name}] Initialized with DataFrame shape: {df.shape if df is not None else (0,0)}")

    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Execute data cleaning based on the query or default to full cleaning.
        Args:
            query: The user's question
            data: The DataFrame to clean
            **kwargs: Additional context parameters
        Returns:
            Dict with cleaned data information
        """
        # Update dataframe if provided in the call
        if data is not None and not data.empty:
            self.df = data.copy()
            self.original_df = data.copy()
            
        # Initialize detailed results
        self.detailed_results = {
            "units_normalized": [],
            "numeric_conversions": [],
            "date_conversions": [],
            "outliers_fixed": [],
            "duplicates_removed": 0,
            "missing_values_handled": {}
        }
            
        # Determine what cleaning to perform based on the query
        query_lower = query.lower()
        
        if "normalize" in query_lower or "units" in query_lower:
            self.normalize_units()
            result_df = self.df
        elif "numeric" in query_lower or "convert" in query_lower:
            self.fix_numerics()
            result_df = self.df
        elif "date" in query_lower or "time" in query_lower:
            self.normalize_dates()
            result_df = self.df
        elif "outlier" in query_lower or "anomaly" in query_lower:
            self.handle_outliers()
            result_df = self.df
        elif "duplicate" in query_lower:
            self.remove_duplicates()
            result_df = self.df
        else:
            # Default to full cleaning
            result_df = self.clean()
            
        # Calculate cleaning impact statistics
        stats = self._calculate_cleaning_stats()
            
        return {
            "cleaned_data": result_df,
            "operations": self.cleaning_operations,
            "cleaning_stats": stats,
            "detailed_results": self.detailed_results
        }

    def normalize_units(self) -> pd.DataFrame:
        """
        Normalize units in string columns (e.g., kg, lbs, currency).
        Returns:
            pd.DataFrame: The DataFrame with normalized units.
        """
        logger.info(f"[{self.name}] normalize_units called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot normalize units on empty DataFrame")
                return self.df
                
            for col in self.df.columns:
                if self.df[col].dtype == "object":
                    original_values = self.df[col].copy()
                    
                    # Track conversion types
                    unit_types_found = set()
                    sample_conversions = []
                    
                    # Process each value and track transformations
                    for idx, val in enumerate(self.df[col]):
                        if isinstance(val, str):
                            val_lower = val.strip().lower()
                            conversion_type = None
                            
                            # Detect unit type
                            if "kg" in val_lower:
                                conversion_type = "weight_kg"
                            elif any(unit in val_lower for unit in ["lb", "lbs", "pound"]):
                                conversion_type = "weight_lb_to_kg"
                            elif any(unit in val_lower for unit in ["oz", "ounce"]):
                                conversion_type = "weight_oz_to_kg"
                            elif "km" in val_lower:
                                conversion_type = "distance_km"
                            elif "mi" in val_lower or "mile" in val_lower:
                                conversion_type = "distance_mi_to_km"
                            elif "ft" in val_lower or "foot" in val_lower or "feet" in val_lower:
                                conversion_type = "distance_ft_to_m"
                            elif any(currency in val_lower for currency in ["₹", "$", "€", "£", "¥"]):
                                conversion_type = "currency"
                            elif "°f" in val_lower or "fahrenheit" in val_lower:
                                conversion_type = "temp_f_to_c"
                            elif "°c" in val_lower or "celsius" in val_lower:
                                conversion_type = "temp_c"
                                
                            if conversion_type:
                                unit_types_found.add(conversion_type)
                                # Store a few examples of conversions
                                if len(sample_conversions) < 5:
                                    sample_conversions.append({
                                        "from": val,
                                        "conversion_type": conversion_type
                                    })
                    
                    # Apply the standardization
                    self.df[col] = self.df[col].apply(self._standardize_unit)
                    
                    # Check if any values changed
                    changed_mask = original_values != self.df[col]
                    changed_count = changed_mask.sum()
                    
                    if changed_count > 0:
                        # Update the sample conversions with "to" values
                        for i, sample in enumerate(sample_conversions):
                            if i < len(changed_mask) and changed_mask.iloc[i]:
                                sample["to"] = self.df[col].iloc[i]
                            
                        self.cleaning_operations.append({
                            "operation": "normalize_units",
                            "column": col,
                            "count_changed": changed_count,
                            "unit_types": list(unit_types_found)
                        })
                        
                        # Update detailed results with enhanced information
                        self.detailed_results["units_normalized"].append({
                            "column": col,
                            "count_changed": changed_count,
                            "unit_types": list(unit_types_found),
                            "examples": sample_conversions,
                            "original_sample": original_values[changed_mask].head(3).tolist(),
                            "normalized_sample": self.df[col][changed_mask].head(3).tolist()
                        })
                    
            logger.info(f"[{self.name}] normalize_units completed.")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in normalize_units: {str(e)}")
            return self.df  # Return original DataFrame if error

    def _standardize_unit(self, val: Any) -> Any:
        """
        Standardize a single value for units and currency.
        Args:
            val (Any): The value to standardize.
        Returns:
            Any: The standardized value.
        """
        if not isinstance(val, str):
            return val

        try:
            val_lower = val.strip().lower()
            # Define regex pattern for extracting numeric values once to reduce duplication
            numeric_pattern = r'[^\d.]'
            
            # Weight normalization
            if "kg" in val_lower:
                numeric_val = float(re.sub(numeric_pattern, '', val_lower))
                return round(numeric_val, 2)
            elif any(unit in val_lower for unit in ["lb", "lbs", "pound"]):
                lbs = float(re.sub(numeric_pattern, '', val_lower))
                return round(lbs * 0.453592, 2)  # Convert to kg
            elif any(unit in val_lower for unit in ["oz", "ounce"]):
                oz = float(re.sub(numeric_pattern, '', val_lower))
                return round(oz * 0.0283495, 3)  # Convert to kg
                
            # Distance/length normalization
            elif "km" in val_lower:
                numeric_val = float(re.sub(numeric_pattern, '', val_lower))
                return round(numeric_val, 3)
            elif "mi" in val_lower or "mile" in val_lower:
                miles = float(re.sub(numeric_pattern, '', val_lower))
                return round(miles * 1.60934, 3)  # Convert to km
            elif "ft" in val_lower or "foot" in val_lower or "feet" in val_lower:
                feet = float(re.sub(numeric_pattern, '', val_lower))
                return round(feet * 0.3048, 3)  # Convert to meters
                
            # Currency normalization
            elif any(currency in val_lower for currency in ["₹", "$", "€", "£", "¥"]):
                numeric_val = re.sub(numeric_pattern, '', val_lower)
                return float(numeric_val) if numeric_val else val
            
            # Temperature
            elif "°f" in val_lower or "fahrenheit" in val_lower:
                fahrenheit = float(re.sub(numeric_pattern, '', val_lower))
                return round((fahrenheit - 32) * 5/9, 2)  # Convert to Celsius
            elif "°c" in val_lower or "celsius" in val_lower:
                return float(re.sub(numeric_pattern, '', val_lower))
                
        except Exception as e:
            logger.error(f"[{self.name}] Error standardizing unit: {val}, error: {str(e)}")
            
        return val

    def fix_numerics(self) -> pd.DataFrame:
        """
        Attempt to convert object columns to numeric types where possible.
        Returns:
            pd.DataFrame: The DataFrame with fixed numerics.
        """
        logger.info(f"[{self.name}] fix_numerics called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot fix numerics on empty DataFrame")
                return self.df
                
            for col in self.df.columns:
                if self.df[col].dtype == "object":
                    original_dtype = self.df[col].dtype
                    original_values = self.df[col].copy()
                    
                    try:
                        # Try to convert to numeric with coercing to identify all potential numbers
                        self.df[col] = pd.to_numeric(self.df[col], errors="coerce")
                        
                        # Gather conversion examples
                        changed_mask = pd.notna(self.df[col]) & (self.df[col].astype(str) != original_values.astype(str))
                        conversion_examples = []
                        
                        if changed_mask.any():
                            # Get up to 5 examples of converted values
                            sample_indices = changed_mask[changed_mask].index[:5]
                            for idx in sample_indices:
                                conversion_examples.append({
                                    "from": str(original_values[idx]),
                                    "to": str(self.df[col][idx]),
                                    "index": int(idx)
                                })
                        
                        # Calculate conversion stats
                        conversion_count = pd.notna(self.df[col]).sum()
                        original_non_na_count = original_values.notna().sum()
                        success_rate = round(conversion_count / max(1, original_non_na_count) * 100, 2)
                        
                        # Check if conversion was successful
                        if self.df[col].dtype != original_dtype and success_rate > 50:
                            self.cleaning_operations.append({
                                "operation": "convert_numeric",
                                "column": col,
                                "from_type": str(original_dtype),
                                "to_type": str(self.df[col].dtype),
                                "conversion_rate": f"{success_rate}%",
                                "values_converted": int(conversion_count)
                            })
                            
                            # Update detailed results with more informative data
                            self.detailed_results["numeric_conversions"].append({
                                "column": col,
                                "from_type": str(original_dtype),
                                "to_type": str(self.df[col].dtype),
                                "success_rate": success_rate,
                                "values_converted": int(conversion_count),
                                "total_values": int(original_non_na_count),
                                "na_before": int(original_values.isna().sum()),
                                "na_after": int(self.df[col].isna().sum()),
                                "examples": conversion_examples,
                                "min_value": None if self.df[col].isna().all() else float(self.df[col].min()),
                                "max_value": None if self.df[col].isna().all() else float(self.df[col].max())
                            })
                        else:
                            # Revert if the conversion wasn't successful
                            self.df[col] = original_values
                    except Exception as e:
                        logger.error(f"[{self.name}] Error fixing numerics in column {col}: {str(e)}")
                        
            logger.info(f"[{self.name}] fix_numerics completed.")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in fix_numerics: {str(e)}")
            return self.df  # Return original DataFrame if error

    def normalize_dates(self) -> pd.DataFrame:
        """
        Normalize date/time columns to datetime dtype.
        Returns:
            pd.DataFrame: The DataFrame with normalized dates.
        """
        logger.info(f"[{self.name}] normalize_dates called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot normalize dates on empty DataFrame")
                return self.df
            
            # Identify potential date columns
            date_keywords = ["date", "time", "day", "year", "month"]
            potential_date_cols = [
                col for col in self.df.columns
                if any(keyword in col.lower() for keyword in date_keywords)
                or (self.df[col].dtype == "object" and self._is_likely_date(self.df[col]))
            ]
            
            for col in potential_date_cols:
                original_dtype = self.df[col].dtype
                original_values = self.df[col].copy()
                
                try:
                    # Try to convert to datetime
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                    
                    # Get conversion stats
                    conversion_count = pd.notna(self.df[col]).sum()
                    original_non_na_count = original_values.notna().sum()
                    success_rate = round(conversion_count / max(1, original_non_na_count) * 100, 2)
                    
                    # Collect sample conversions
                    changed_mask = pd.notna(self.df[col]) & (original_values != self.df[col])
                    date_examples = []
                    
                    if changed_mask.any():
                        # Get up to 5 examples of date conversions
                        sample_indices = changed_mask[changed_mask].index[:5]
                        for idx in sample_indices:
                            date_examples.append({
                                "from": str(original_values[idx]),
                                "to": str(self.df[col][idx]),
                                "index": int(idx)
                            })
                    
                    # Check if conversion was successful
                    if pd.api.types.is_datetime64_dtype(self.df[col].dtype) and success_rate > 50:
                        # Generate format string based on data
                        format_detected = "Unknown"
                        if not self.df[col].empty and not self.df[col].isna().all():
                            sample_date = self.df[col].dropna().iloc[0]
                            if isinstance(sample_date, pd.Timestamp):
                                if sample_date.hour == 0 and sample_date.minute == 0 and sample_date.second == 0:
                                    format_detected = "YYYY-MM-DD"
                                else:
                                    format_detected = "YYYY-MM-DD HH:MM:SS"
                        
                        # Extract date range
                        min_date = None
                        max_date = None
                        if not self.df[col].isna().all():
                            min_date = self.df[col].min().strftime("%Y-%m-%d") if pd.notna(self.df[col].min()) else None
                            max_date = self.df[col].max().strftime("%Y-%m-%d") if pd.notna(self.df[col].max()) else None
                        
                        self.cleaning_operations.append({
                            "operation": "convert_datetime",
                            "column": col,
                            "from_type": str(original_dtype),
                            "to_type": "datetime64",
                            "success_rate": f"{success_rate}%",
                            "format_detected": format_detected,
                            "date_range": f"{min_date} to {max_date}" if min_date and max_date else "unknown"
                        })
                        
                        # Update detailed results with enhanced information
                        self.detailed_results["date_conversions"].append({
                            "column": col,
                            "from_type": str(original_dtype),
                            "to_type": "datetime64",
                            "success_rate": success_rate,
                            "values_converted": int(conversion_count),
                            "format_detected": format_detected,
                            "date_range": {
                                "min": min_date,
                                "max": max_date
                            },
                            "examples": date_examples,
                            "na_before": int(original_values.isna().sum()),
                            "na_after": int(self.df[col].isna().sum()),
                            "time_components": not self.df[col].dropna().dt.time.eq(pd.Timestamp('00:00:00').time()).all() if not self.df[col].empty else False
                        })
                    else:
                        # If conversion wasn't successful, revert
                        self.df[col] = original_values
                except Exception as e:
                    logger.error(f"[{self.name}] Error converting column {col} to datetime: {str(e)}")
            
            logger.info(f"[{self.name}] normalize_dates completed.")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in normalize_dates: {str(e)}")
            return self.df
    
    def _is_likely_date(self, series: pd.Series) -> bool:
        """Helper method to detect if a series likely contains dates"""
        # Sample the series to avoid processing the entire column
        sample = series.dropna().head(20).astype(str)
        
        # Date patterns to check
        date_patterns = [
            r'\d{1,4}[-/]\d{1,2}[-/]\d{2,4}',  # yyyy-mm-dd, mm/dd/yyyy, etc.
            r'\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}',  # dd Mon yyyy, etc.
            r'[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}'  # Mon dd, yyyy, etc.
        ]
        
        # Check if at least some values match date patterns
        match_count = 0
        for value in sample:
            if any(re.search(pattern, value) for pattern in date_patterns):
                match_count += 1
                
        # Return True if enough values match date patterns
        return match_count >= len(sample) * 0.5
    
    def handle_outliers(self) -> pd.DataFrame:
        """
        Detect and handle outliers in numeric columns.
        Returns:
            pd.DataFrame: DataFrame with outliers handled.
        """
        logger.info(f"[{self.name}] handle_outliers called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot handle outliers on empty DataFrame")
                return self.df
            
            numeric_cols = self.df.select_dtypes(include=['number']).columns
            
            for col in numeric_cols:
                # Skip ID-like columns
                if col.lower().endswith('id'):
                    continue
                    
                # Calculate IQR
                Q1 = self.df[col].quantile(0.25)
                Q3 = self.df[col].quantile(0.75)
                IQR = Q3 - Q1
                
                # Define outlier bounds
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                # Identify outliers
                outliers = ((self.df[col] < lower_bound) | (self.df[col] > upper_bound))
                outlier_count = outliers.sum()
                
                if outlier_count > 0:
                    # Handle outliers by capping
                    original_values = self.df[col].copy()
                    
                    # Collect samples of outlier values before fixing
                    outlier_indices = outliers[outliers].index
                    lower_outliers = outlier_indices[self.df.loc[outlier_indices, col] < lower_bound]
                    upper_outliers = outlier_indices[self.df.loc[outlier_indices, col] > upper_bound]
                    
                    # Sample outliers
                    lower_samples = []
                    if len(lower_outliers) > 0:
                        for idx in lower_outliers[:min(3, len(lower_outliers))]:
                            lower_samples.append({
                                "index": int(idx),
                                "value": float(self.df.loc[idx, col]),
                                "boundary": float(lower_bound)
                            })
                    
                    upper_samples = []
                    if len(upper_outliers) > 0:
                        for idx in upper_outliers[:min(3, len(upper_outliers))]:
                            upper_samples.append({
                                "index": int(idx),
                                "value": float(self.df.loc[idx, col]),
                                "boundary": float(upper_bound)
                            })
                    
                    # Apply capping
                    self.df.loc[self.df[col] < lower_bound, col] = lower_bound
                    self.df.loc[self.df[col] > upper_bound, col] = upper_bound
                    
                    # Calculate column stats
                    column_mean = float(self.df[col].mean())
                    column_median = float(self.df[col].median())
                    column_std = float(self.df[col].std())
                    
                    # Calculate percentages
                    lower_pct = len(lower_outliers) / outlier_count * 100 if outlier_count > 0 else 0
                    upper_pct = len(upper_outliers) / outlier_count * 100 if outlier_count > 0 else 0
                    total_pct = outlier_count / len(self.df) * 100
                    
                    self.cleaning_operations.append({
                        "operation": "handle_outliers",
                        "column": col,
                        "outlier_count": int(outlier_count),
                        "lower_outliers": len(lower_outliers),
                        "upper_outliers": len(upper_outliers),
                        "lower_bound": float(lower_bound),
                        "upper_bound": float(upper_bound),
                        "percentage_affected": round(total_pct, 2)
                    })
                    
                    # Update detailed results with comprehensive information
                    self.detailed_results["outliers_fixed"].append({
                        "column": col,
                        "total_outliers": int(outlier_count),
                        "lower_outliers": len(lower_outliers),
                        "upper_outliers": len(upper_outliers),
                        "percentage_of_data": round(total_pct, 2),
                        "bounds": {
                            "lower": float(lower_bound),
                            "upper": float(upper_bound),
                            "q1": float(Q1),
                            "q3": float(Q3),
                            "iqr": float(IQR)
                        },
                        "statistics": {
                            "mean": column_mean,
                            "median": column_median,
                            "std": column_std
                        },
                        "lower_samples": lower_samples,
                        "upper_samples": upper_samples,
                        "lower_bound": float(lower_bound),
                        "upper_bound": float(upper_bound)
                    })
            
            logger.info(f"[{self.name}] handle_outliers completed.")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in handle_outliers: {str(e)}")
            return self.df
    
    def remove_duplicates(self) -> pd.DataFrame:
        """
        Remove duplicate rows from the DataFrame.
        Returns:
            pd.DataFrame: DataFrame with duplicates removed.
        """
        logger.info(f"[{self.name}] remove_duplicates called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot remove duplicates on empty DataFrame")
                return self.df
                
            # Look for duplicate rows and analyze them before removal
            original_count = len(self.df)
            
            # Find duplicates
            duplicate_mask = self.df.duplicated(keep='first')
            duplicate_count = duplicate_mask.sum()
            
            # Analyze duplicates if present
            duplicate_details = {}
            if duplicate_count > 0:
                # Get a sample of duplicate rows
                duplicate_samples = self.df[duplicate_mask].head(min(5, duplicate_count)).to_dict('records')
                
                # Try to identify columns that might be causing duplicates
                # For each column, check if duplicated values tend to have the same value
                potential_duplicate_columns = []
                for col in self.df.columns:
                    # Get values in the original duplicated rows
                    dup_val_counts = self.df.loc[duplicate_mask, col].value_counts()
                    
                    # If >50% of duplicates have same value in this column, it may be significant
                    if dup_val_counts.iloc[0] > duplicate_count * 0.5:
                        potential_duplicate_columns.append({
                            "column": col,
                            "dominant_value": str(dup_val_counts.index[0]),
                            "occurrence_count": int(dup_val_counts.iloc[0]),
                            "percentage": round(dup_val_counts.iloc[0] / duplicate_count * 100, 2)
                        })
                
                duplicate_details = {
                    "total_duplicates": int(duplicate_count),
                    "percentage_of_data": round(duplicate_count / original_count * 100, 2),
                    "potential_duplicate_columns": potential_duplicate_columns,
                    "sample_rows": duplicate_samples
                }
            
            # Remove duplicates
            self.df = self.df.drop_duplicates()
            new_count = len(self.df)
            
            duplicates_removed = original_count - new_count
            
            if duplicates_removed > 0:
                self.cleaning_operations.append({
                    "operation": "remove_duplicates",
                    "count_removed": duplicates_removed,
                    "original_count": original_count,
                    "new_count": new_count,
                    "percentage_removed": round(duplicates_removed / original_count * 100, 2)
                })
                
                # Update detailed results with comprehensive information
                self.detailed_results["duplicates_removed"] = duplicates_removed
                self.detailed_results["duplicate_details"] = duplicate_details
                
            logger.info(f"[{self.name}] remove_duplicates completed: {duplicates_removed} rows removed.")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in remove_duplicates: {str(e)}")
            return self.df

    def clean(self) -> pd.DataFrame:
        """
        Clean the DataFrame by applying all cleaning operations.
        Returns:
            pd.DataFrame: The cleaned DataFrame.
        """
        logger.info(f"[{self.name}] clean called.")
        try:
            if self.df is None or self.df.empty:
                logger.warning(f"[{self.name}] Cannot clean empty DataFrame")
                return self.df
                
            # Reset operations list
            self.cleaning_operations = []
            
            # Apply all cleaning operations in sequence
            self.normalize_units()
            self.fix_numerics()
            self.normalize_dates()
            self.handle_outliers()
            self.remove_duplicates()
            
            logger.info(f"[{self.name}] Data cleaned. Operations: {len(self.cleaning_operations)}")
            return self.df
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in clean: {str(e)}")
            return self.original_df  # Return original DataFrame if error
            
    def _calculate_cleaning_stats(self) -> Dict[str, Any]:
        """Calculate statistics about the cleaning impact"""
        stats = {
            "operations_count": len(self.cleaning_operations),
            "operations_by_type": {},
            "columns_modified": set(),
            "operation_details": {},  # Store additional details by operation type
        }
        
        # Count operations by type and gather details
        for op in self.cleaning_operations:
            op_type = op.get("operation", "unknown")
            stats["operations_by_type"][op_type] = stats["operations_by_type"].get(op_type, 0) + 1
            
            # Track modified columns
            if "column" in op:
                stats["columns_modified"].add(op["column"])
            
            # Gather operation-specific details
            if op_type not in stats["operation_details"]:
                stats["operation_details"][op_type] = {}
                
            # Add details based on operation type
            if op_type == "normalize_units" and "count_changed" in op:
                stats["operation_details"][op_type]["total_values_normalized"] = \
                    stats["operation_details"][op_type].get("total_values_normalized", 0) + op["count_changed"]
                    
                if "unit_types" in op:
                    if "unit_types" not in stats["operation_details"][op_type]:
                        stats["operation_details"][op_type]["unit_types"] = set()
                    stats["operation_details"][op_type]["unit_types"].update(op["unit_types"])
                    
            elif op_type == "handle_outliers" and "outlier_count" in op:
                stats["operation_details"][op_type]["total_outliers_fixed"] = \
                    stats["operation_details"][op_type].get("total_outliers_fixed", 0) + op["outlier_count"]
                    
                if "lower_outliers" in op and "upper_outliers" in op:
                    stats["operation_details"][op_type]["lower_outliers"] = \
                        stats["operation_details"][op_type].get("lower_outliers", 0) + op["lower_outliers"]
                    stats["operation_details"][op_type]["upper_outliers"] = \
                        stats["operation_details"][op_type].get("upper_outliers", 0) + op["upper_outliers"]
                        
            elif op_type == "convert_numeric" and "values_converted" in op:
                stats["operation_details"][op_type]["total_values_converted"] = \
                    stats["operation_details"][op_type].get("total_values_converted", 0) + op["values_converted"]
        
        # Convert sets to lists for JSON serialization
        stats["columns_modified"] = list(stats["columns_modified"])
        if "normalize_units" in stats["operation_details"] and "unit_types" in stats["operation_details"]["normalize_units"]:
            stats["operation_details"]["normalize_units"]["unit_types"] = \
                list(stats["operation_details"]["normalize_units"]["unit_types"])
        
        # Calculate data changes
        if not self.df.empty and not self.original_df.empty:
            # Calculate shape difference
            stats["rows_before"] = len(self.original_df)
            stats["rows_after"] = len(self.df)
            stats["row_count_change"] = len(self.df) - len(self.original_df)
            
            # Calculate missing values change
            missing_before = self.original_df.isna().sum().sum()
            missing_after = self.df.isna().sum().sum()
            stats["missing_values_before"] = int(missing_before)
            stats["missing_values_after"] = int(missing_after)
            stats["missing_values_change"] = int(missing_after - missing_before)
            
            # Calculate data type changes
            dtype_changes = []
            for col in self.df.columns:
                if col in self.original_df.columns and self.df[col].dtype != self.original_df[col].dtype:
                    dtype_changes.append({
                        "column": col,
                        "from_type": str(self.original_df[col].dtype),
                        "to_type": str(self.df[col].dtype)
                    })
            
            if dtype_changes:
                stats["dtype_changes"] = dtype_changes
                
            # Add overall data quality assessment
            quality_score = 100
            
            # Penalize for missing values
            if stats["missing_values_after"] > 0:
                missing_ratio = stats["missing_values_after"] / (self.df.size)
                quality_score -= min(30, missing_ratio * 100)  # Up to 30 points penalty
                
            # Penalize for outliers if any were found
            if "handle_outliers" in stats["operation_details"] and "total_outliers_fixed" in stats["operation_details"]["handle_outliers"]:
                outlier_penalty = min(20, stats["operation_details"]["handle_outliers"]["total_outliers_fixed"] / len(self.df) * 100)
                quality_score -= outlier_penalty
                
            # Add score to stats
            stats["data_quality_score"] = max(0, min(100, round(quality_score, 1)))
            
        return stats
