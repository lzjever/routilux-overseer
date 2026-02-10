"""Data transformation routines for E2E testing."""

from typing import Any
from routilux import Routine
from routilux.cli.decorators import auto_register_routine


@auto_register_routine(
    name="e2e_data_transformer",
    category="e2e_processor",
    tags=["processor", "transform", "e2e"],
    description="E2E test: Transforms data by adding computed fields"
)
class DataTransformer(Routine):
    """Transforms input data by adding computed fields.

    Demonstrates a simple data processing pipeline.
    """

    def setup(self):
        self.add_slot("input", handler=self.transform)
        self.add_event("output", schema=["data", "transform_metadata"])

    def transform(self, data: list[dict[str, Any]], transform_type: str = "uppercase", **kwargs) -> dict[str, Any]:
        """Transform the input data.

        Args:
            data: Input data list
            transform_type: Type of transformation ("uppercase", "prefix", "compute")
            **kwargs: Additional parameters

        Returns:
            Transformed data with metadata
        """
        if not isinstance(data, list):
            return {"data": None, "transform_metadata": {"error": "data must be a list"}}

        result = []

        for item in data:
            if transform_type == "uppercase" and "value" in item:
                new_item = {**item, "value": str(item["value"]).upper()}
            elif transform_type == "prefix" and "value" in item:
                new_item = {**item, "value": f"transformed_{item['value']}"}
            elif transform_type == "compute":
                new_item = {
                    **item,
                    "processed": True,
                    "computed": item.get("id", 0) * 2
                }
            else:
                new_item = {**item, "transformed": True}

            result.append(new_item)

        return {
            "data": result,
            "transform_metadata": {
                "transform_type": transform_type,
                "input_count": len(data),
                "output_count": len(result)
            }
        }


@auto_register_routine(
    name="e2e_data_filter",
    category="e2e_processor",
    tags=["processor", "filter", "e2e"],
    description="E2E test: Filters data based on conditions"
)
class DataFilter(Routine):
    """Filters input data based on conditions.

    Useful for testing conditional flows and branching.
    """

    def setup(self):
        self.add_slot("input", handler=self.filter)
        self.add_event("output", schema=["data", "filtered_out", "filter_metadata"])

    def filter(
        self,
        data: list[dict[str, Any]],
        filter_type: str = "non_null",
        threshold: int = 0,
        **kwargs
    ) -> dict[str, Any]:
        """Filter the input data.

        Args:
            data: Input data list
            filter_type: Type of filter ("non_null", "threshold", "even")
            threshold: Threshold value for filtering
            **kwargs: Additional parameters

        Returns:
            Filtered data with metadata
        """
        if not isinstance(data, list):
            return {
                "data": [],
                "filtered_out": [],
                "filter_metadata": {"error": "data must be a list"}
            }

        filtered = []
        filtered_out = []

        for item in data:
            include = False

            if filter_type == "non_null":
                include = item.get("value") is not None
            elif filter_type == "threshold":
                include = item.get("id", 0) >= threshold
            elif filter_type == "even":
                include = item.get("id", 0) % 2 == 0
            else:
                include = True

            if include:
                filtered.append(item)
            else:
                filtered_out.append(item)

        return {
            "data": filtered,
            "filtered_out": filtered_out,
            "filter_metadata": {
                "filter_type": filter_type,
                "input_count": len(data),
                "filtered_count": len(filtered),
                "excluded_count": len(filtered_out)
            }
        }


@auto_register_routine(
    name="e2e_data_aggregator",
    category="e2e_processor",
    tags=["processor", "aggregate", "e2e"],
    description="E2E test: Aggregates data into summary statistics"
)
class DataAggregator(Routine):
    """Aggregates input data into summary statistics.

    Useful for testing reduction operations and analytics flows.
    """

    def setup(self):
        self.add_slot("input", handler=self.aggregate)
        self.add_event("output", schema=["summary", "statistics"])

    def aggregate(self, data: list[dict[str, Any]], aggregate_by: str = "count", **kwargs) -> dict[str, Any]:
        """Aggregate the input data.

        Args:
            data: Input data list
            aggregate_by: Aggregation type ("count", "sum", "average")
            **kwargs: Additional parameters

        Returns:
            Aggregated summary with statistics
        """
        if not isinstance(data, list):
            return {
                "summary": None,
                "statistics": {"error": "data must be a list"}
            }

        count = len(data)

        if aggregate_by == "count":
            summary = {"total_count": count}
        elif aggregate_by == "sum":
            total = sum(item.get("id", 0) for item in data)
            summary = {"total": total, "count": count}
        elif aggregate_by == "average":
            values = [item.get("id", 0) for item in data if "id" in item]
            avg = sum(values) / len(values) if values else 0
            summary = {"average": avg, "count": count}
        else:
            summary = {"count": count}

        return {
            "summary": summary,
            "statistics": {
                "aggregate_by": aggregate_by,
                "input_count": count,
                "has_data": count > 0
            }
        }


@auto_register_routine(
    name="e2e_error_simulator",
    category="e2e_processor",
    tags=["processor", "error", "e2e"],
    description="E2E test: Simulates errors for testing error handling"
)
class ErrorSimulator(Routine):
    """Simulates various error conditions.

    Useful for testing error handling and recovery mechanisms.
    """

    def setup(self):
        self.add_slot("input", handler=self.process)
        self.add_event("output", schema=["data", "error_info"])

    def process(self, data: Any = None, error_type: str = "none", **kwargs) -> dict[str, Any]:
        """Process data, potentially simulating an error.

        Args:
            data: Input data (can be anything)
            error_type: Type of error to simulate ("none", "value_error", "type_error", "runtime")
            **kwargs: Additional parameters

        Returns:
            Processed data or error info

        Raises:
            Various exceptions based on error_type
        """
        if error_type == "none":
            return {"data": data, "error_info": {"error": None}}
        elif error_type == "value_error":
            raise ValueError(f"Simulated value error with data: {data}")
        elif error_type == "type_error":
            raise TypeError(f"Simulated type error for data type: {type(data)}")
        elif error_type == "runtime":
            raise RuntimeError("Simulated runtime error")
        else:
            return {"data": data, "error_info": {"error": None}}
