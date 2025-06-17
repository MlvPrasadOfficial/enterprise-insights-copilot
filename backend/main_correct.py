@api_v1.get("/data-cleaner-results")
async def get_data_cleaner_results(request: Request):
    """
    Get the most recent Data Cleaner agent results.
    Optional query param: session_id (defaults to "default")
    Returns: {
        "operations": List of cleaning operations,
        "cleaning_stats": Statistics about the cleaning impact,
        "detailed_results": Detailed breakdown of cleaning operations
    }
    """
    logger.info(f"[DATA-CLEANER] Endpoint called with request: {request.query_params}")
    try:
        from backend.core.agent_status import get_agent_statuses
        import pandas as pd
        import traceback
        from backend.agents.data_cleaner_agent import DataCleanerAgent
        
        session_id = request.query_params.get("session_id", "default")
        logger.info(f"[DATA-CLEANER] Getting results for session_id: {session_id}")
        
        agent_statuses = get_agent_statuses(session_id)
        logger.info(f"[DATA-CLEANER] Found {len(agent_statuses)} total agents")
        
        # Find the Data Cleaner agent
        cleaner_agents = [agent for agent in agent_statuses if agent.get('type') == 'cleaner']
        logger.info(f"[DATA-CLEANER] Found {len(cleaner_agents)} cleaner agents")
        
        # First try to get results from agent status
        cleaning_result = {}
        if cleaner_agents:
            # Get the most recent Data Cleaner agent
            cleaner_agent = cleaner_agents[-1]
            logger.info(f"[DATA-CLEANER] Latest cleaner agent: {cleaner_agent.get('name')}, status: {cleaner_agent.get('status')}")
            
            # Look for cleaningResult or any similar property
            agent_data_keys = list(cleaner_agent.keys())
            logger.info(f"[DATA-CLEANER] Agent data keys: {agent_data_keys}")
            
            for key in cleaner_agent:
                if key.lower() == 'cleaningresult':
                    cleaning_result = cleaner_agent[key]
                    logger.info(f"[DATA-CLEANER] Found cleaning results in agent status with keys: {list(cleaning_result.keys()) if isinstance(cleaning_result, dict) else 'not a dict'}")
                    break
                    
        # If we don't have results from status, try to regenerate them if possible
        if (not cleaning_result or 
            not cleaning_result.get("operations") or 
            not cleaning_result.get("cleaning_stats")):
            
            logger.info(f"[DATA-CLEANER] No complete cleaning results found in agent status, trying to regenerate")
            
            # Let's check if we have data in memory from the file upload
            memory_has_data = False
            try:
                from backend.core.session_memory import memory
                
                memory_has_data = memory.df is not None and not memory.df.empty
                logger.info(f"[DATA-CLEANER] Memory check: has_data={memory_has_data}, " + 
                           f"filename={memory.filename}, " + 
                           f"shape={memory.df.shape if memory_has_data else 'None'}")
                
                if memory_has_data:
                    logger.info(f"[DATA-CLEANER] Regenerating results from memory DataFrame with shape: {memory.df.shape}")
                    
                    # Create a new cleaner instance and clean the data
                    cleaner = DataCleanerAgent(memory.df)
                    logger.info(f"[DATA-CLEANER] Created DataCleanerAgent instance")
                    
                    result = cleaner._execute("", memory.df)
                    logger.info(f"[DATA-CLEANER] Executed cleaner with result keys: {list(result.keys())}")
                    
                    # Format cleaning results for the frontend including detailed results
                    cleaning_result = {
                        "operations": result["operations"],
                        "cleaning_stats": result["cleaning_stats"],
                        "detailed_results": result.get("detailed_results", {})
                    }
                    
                    logger.info(f"[DATA-CLEANER] Regenerated cleaning_result with {len(result['operations'])} operations, " + 
                               f"{len(result['cleaning_stats'])} stats entries, and " + 
                               f"detailed_results={True if result.get('detailed_results') else False}")
                    
                    # Log detailed information about what was performed
                    logger.info(f"[DATA-CLEANER] Cleaning operations performed: {len(result['operations'])}")
                    for op_type, count in result['cleaning_stats'].get('operations_by_type', {}).items():
                        logger.info(f"[DATA-CLEANER] {op_type}: {count} operations")
                        
                    if 'operation_details' in result['cleaning_stats']:
                        for op_type, details in result['cleaning_stats']['operation_details'].items():
                            logger.info(f"[DATA-CLEANER] {op_type} details: {details}")
                    
                    # Update the agent status with the enhanced results
                    from backend.core.agent_status import update_agent_status
                    update_agent_status(
                        session_id=session_id,
                        agent_name="Data Cleaner",
                        status="complete",
                        agent_type="cleaner",
                        message="Data cleaning completed with detailed results",
                        additional_data={"cleaningResult": cleaning_result}
                    )
                    
                    logger.info(f"[DATA-CLEANER] Generated enhanced cleaning results")
            
            except ImportError as e:
                logger.error(f"[DATA-CLEANER] Import error accessing memory: {e}")
                logger.error(traceback.format_exc())
            except Exception as cleaner_error:
                logger.error(f"[DATA-CLEANER] Error generating cleaning results: {cleaner_error}")
                logger.error(traceback.format_exc())
            
            if not memory_has_data:
                logger.warning("[DATA-CLEANER] No data available in memory to clean")
        
        # If still no results, create minimal structure with detailed results placeholders
        if not cleaning_result:
            logger.warning(f"[DATA-CLEANER] No cleaning results found, returning empty structure")
            cleaning_result = {
                "operations": [],
                "cleaning_stats": {
                    "operations_count": 0,
                    "operations_by_type": {},
                    "columns_modified": [],
                    "rows_before": 0,
                    "rows_after": 0,
                    "row_count_change": 0,
                    "missing_values_before": 0,
                    "missing_values_after": 0,
                    "missing_values_change": 0
                },
                "detailed_results": {
                    "units_normalized": [],
                    "numeric_conversions": [],
                    "date_conversions": [],
                    "outliers_fixed": [],
                    "duplicates_removed": 0
                }
            }
        
        return cleaning_result
    except Exception as e:
        logger.error(f"[DATA-CLEANER] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data cleaner results: {str(e)}")
