"""Data generator source routine for E2E testing."""

from typing import Any
from routilux import Routine
from routilux.cli.decorators import auto_register_routine


@auto_register_routine(
    name="e2e_data_generator",
    category="e2e_source",
    tags=["source", "generator", "e2e"],
    description="E2E test: Generates configurable test data"
)
class DataGenerator(Routine):
    """Generates test data for E2E testing.

    Produces configurable sequences of data items with metadata.
    Supports various data patterns for testing different scenarios.
    """

    def setup(self):
        """Set up the routine with input slot and output event."""
        self.add_slot("trigger")
        self.add_event("output", output_params=["data", "metadata"])
        self.set_logic(self.generate)

    def generate(self, count: int = 10, pattern: str = "sequential", **kwargs) -> dict[str, Any]:
        """Generate test data.

        Args:
            count: Number of data items to generate
            pattern: Generation pattern ("sequential", "random", "sparse")
            **kwargs: Additional parameters

        Returns:
            Dictionary with data list and metadata
        """
        if pattern == "sequential":
            data = [{"id": i, "value": f"item_{i}", "index": i} for i in range(count)]
        elif pattern == "random":
            import random
            data = [{"id": i, "value": random.randint(1, 1000), "random": True} for i in range(count)]
        elif pattern == "sparse":
            # Generate some null/empty values for testing edge cases
            data = [
                {"id": i, "value": f"item_{i}" if i % 3 != 0 else None}
                for i in range(count)
            ]
        else:
            data = [{"id": i, "value": f"item_{i}"} for i in range(count)]

        return {
            "data": data,
            "metadata": {
                "count": count,
                "pattern": pattern,
                "source": "e2e_data_generator"
            }
        }


@auto_register_routine(
    name="e2e_number_source",
    category="e2e_source",
    tags=["source", "numbers", "e2e"],
    description="E2E test: Generates a sequence of numbers"
)
class NumberSource(Routine):
    """Generates a sequence of numbers for testing.

    Useful for testing aggregation and transformation routines.
    """

    def setup(self):
        self.add_slot("trigger")
        self.add_event("numbers", output_params=["values", "start", "end", "step"])
        self.set_logic(self.generate)

    def generate(
        self,
        start: int = 0,
        end: int = 10,
        step: int = 1,
        **kwargs
    ) -> dict[str, Any]:
        """Generate a sequence of numbers.

        Args:
            start: Starting value
            end: Ending value (exclusive)
            step: Step size

        Returns:
            Dictionary with number sequence
        """
        values = list(range(start, end, step))

        return {
            "values": values,
            "start": start,
            "end": end,
            "step": step,
            "count": len(values)
        }


@auto_register_routine(
    name="e2e_delayed_source",
    category="e2e_source",
    tags=["source", "delay", "e2e"],
    description="E2E test: Generates data with configurable delay for testing async behavior"
)
class DelayedSource(Routine):
    """Generates data after a configurable delay.

    Useful for testing timeout handling, loading states, and async operations.
    """

    def setup(self):
        self.add_slot("trigger")
        self.add_event("output", output_params=["data", "delay"])
        self.set_logic(self.generate)

    def generate(self, delay_ms: int = 1000, **kwargs) -> dict[str, Any]:
        """Generate data after a delay.

        Args:
            delay_ms: Delay in milliseconds

        Returns:
            Dictionary with data and delay info
        """
        import time

        delay_sec = delay_ms / 1000.0
        time.sleep(delay_sec)

        return {
            "data": [{"id": i, "delayed": True} for i in range(5)],
            "delay": delay_ms
        }
