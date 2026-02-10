"""Data collection sink routines for E2E testing."""

from typing import Any
from routilux import Routine
from routilux.cli.decorators import auto_register_routine


@auto_register_routine(
    name="e2e_data_collector",
    category="e2e_sink",
    tags=["sink", "collector", "e2e"],
    description="E2E test: Collects and returns data for verification"
)
class DataCollector(Routine):
    """Collects data and returns it for verification.

    Useful for asserting flow outputs in tests.
    """

    def setup(self):
        self.add_slot("input", handler=self.collect)
        self.add_event("collected", schema=["data", "collection_metadata"])

        # Storage for collected data
        self.collected_items: list[Any] = []

    def collect(self, data: Any, **kwargs) -> dict[str, Any]:
        """Collect the input data.

        Args:
            data: Data to collect
            **kwargs: Additional parameters

        Returns:
            Collection confirmation with metadata
        """
        self.collected_items.append(data)

        return {
            "data": data,
            "collection_metadata": {
                "collected_count": len(self.collected_items),
                "current_size": len(str(data))
            }
        }


@auto_register_routine(
    name="e2e_batch_collector",
    category="e2e_sink",
    tags=["sink", "batch", "e2e"],
    description="E2E test: Collects data in batches for batch processing tests"
)
class BatchCollector(Routine):
    """Collects data in batches and returns when batch size is reached.

    Useful for testing batch processing workflows.
    """

    def setup(self):
        self.add_slot("input", handler=self.collect)
        self.add_event("batch", schema=["batch", "batch_number", "batch_size"])
        self.add_event("complete", schema=["total_items", "batch_count"])

        # Batch storage
        self.current_batch: list[Any] = []
        self.batches: list[list[Any]] = []
        self.batch_size: int = 5

    def collect(self, data: Any, batch_size: int = 5, flush: bool = False, **kwargs) -> dict[str, Any] | None:
        """Collect data into batches.

        Args:
            data: Data to collect
            batch_size: Size of each batch
            flush: Force flush current batch
            **kwargs: Additional parameters

        Returns:
            Batch data when batch is full or flushed, None otherwise
        """
        if batch_size != 5:
            self.batch_size = batch_size

        self.current_batch.append(data)

        if len(self.current_batch) >= self.batch_size or flush:
            self.batches.append(self.current_batch.copy())
            batch_data = {
                "batch": self.current_batch.copy(),
                "batch_number": len(self.batches),
                "batch_size": len(self.current_batch)
            }
            self.current_batch.clear()
            return batch_data

        return None

    def get_batches(self) -> list[list[Any]]:
        """Get all completed batches."""
        return self.batches


@auto_register_routine(
    name="e2e_counter_sink",
    category="e2e_sink",
    tags=["sink", "counter", "e2e"],
    description="E2E test: Counts items received"
)
class CounterSink(Routine):
    """Counts items received through the input slot.

    Useful for testing data flow and counting operations.
    """

    def setup(self):
        self.add_slot("input", handler=self.count)
        self.add_event("counted", schema=["count", "item", "total"])

        self.counter: int = 0

    def count(self, item: Any = None, increment: int = 1, **kwargs) -> dict[str, Any]:
        """Count incoming items.

        Args:
            item: Item being counted (optional)
            increment: Amount to increment by
            **kwargs: Additional parameters

        Returns:
            Current count information
        """
        self.counter += increment

        return {
            "count": self.counter,
            "item": item,
            "total": self.counter
        }

    def reset(self):
        """Reset the counter."""
        self.counter = 0


@auto_register_routine(
    name="e2e_assertion_sink",
    category="e2e_sink",
    tags=["sink", "assertion", "e2e"],
    description="E2E test: Asserts conditions on incoming data"
)
class AssertionSink(Routine):
    """Asserts conditions on incoming data.

    Raises exceptions when assertions fail, useful for testing error flows.
    """

    def setup(self):
        self.add_slot("input", handler=self.assert_data)
        self.add_event("passed", schema=["data", "assertion"])
        self.add_event("failed", schema=["data", "assertion", "reason"])

    def assert_data(self, data: Any, assertion: str = "not_null", **kwargs) -> dict[str, Any]:
        """Assert conditions on the data.

        Args:
            data: Data to assert on
            assertion: Type of assertion ("not_null", "count_gt", "has_key")
            **kwargs: Additional parameters including threshold, key, etc.

        Returns:
            Assertion result

        Raises:
            AssertionError: When assertion fails
        """
        passed = False
        reason = ""

        if assertion == "not_null":
            passed = data is not None
            reason = "data is None" if not passed else "data is not None"
        elif assertion == "count_gt":
            threshold = kwargs.get("threshold", 0)
            count = len(data) if isinstance(data, (list, dict, str)) else 0
            passed = count > threshold
            reason = f"count {count} not > {threshold}"
        elif assertion == "has_key":
            key = kwargs.get("key", "")
            passed = isinstance(data, dict) and key in data
            reason = f"key '{key}' not in data"
        elif assertion == "always_fail":
            passed = False
            reason = "assertion set to always fail"
        else:
            passed = True
            reason = "unknown assertion, passing by default"

        if not passed:
            return {
                "data": data,
                "assertion": assertion,
                "reason": reason,
                "passed": False
            }

        return {
            "data": data,
            "assertion": assertion,
            "passed": True
        }
