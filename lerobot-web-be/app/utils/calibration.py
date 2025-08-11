from queue import Queue


def make_blocking_input(q: Queue):
    def fake_input(prompt=""):
        print(f"[WAITING INPUT] {prompt}")
        try:
            value = q.get(block=True)
            print(f"[GOT INPUT] {value}")
            return value
        except Exception as e:
            raise RuntimeError(f"Input error: {e}")

    return fake_input
