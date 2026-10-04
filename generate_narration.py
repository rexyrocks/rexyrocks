from pathlib import Path
import soundfile as sf
from kokoro import KPipeline

OUT = Path(__file__).parent / "portfolio" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
stories = {
    "risk": "RiskSight. A credit risk model built from first principles. The problem: loan defaults are rare, so accuracy alone can hide whether a model catches the cases that matter. The approach: logistic regression, gradient descent, regularization, and class weighting with NumPy, compared against scikit-learn. The result: held-out evaluation, threshold analysis tied to a simple profit model, and a FastAPI web interface for exploring predictions.",
    "pyro": "Pyrograph. A Jaipur heatwave early warning pipeline. The problem: a daily alert needs a local baseline, recent context, and a clear definition of severe heat. The approach: calendar-based climatology labels, lag features, Random Forest, and XGBoost tested on later years. The result: saved feature contracts and evaluation metrics, plus a five-day outlook with a persistence check for alerts.",
    "miku": "Miku Desktop Companion. An interactive macOS companion built with Electron and a Live2D character. The project combines character interactions, a menu-bar controller, local memory, and optional voice chat. Screen and project observation are opt-in. The public repository includes the Electron app, observer helpers, privacy controls, and development tests.",
    "notes": "Fieldnotes. A shared research log for findings, phases, and responsibilities. The problem: research decisions and implementation notes are easy to lose across chats and personal files. The approach: a React frontend with an Express and SQLite API, organized around research phases. The result: working routes for reading and adding findings, with a deployment path for persistent storage.",
}

pipeline = KPipeline(lang_code="a")
for key, text in stories.items():
    chunks = []
    for _, _, audio in pipeline(text, voice="af_heart", speed=1.0):
        chunks.append(audio)
    import numpy as np
    sf.write(OUT / f"{key}.wav", np.concatenate(chunks), 24000)
    print(f"wrote {OUT / f'{key}.wav'}")
