import argparse
import sys
from rich.console import Console
from rich.table import Table
from app.services.text_compressor import run_ablation_test

def main():
    parser = argparse.ArgumentParser(description="Run NanoPrompt Ablation Study on a text file.")
    parser.add_argument("file", help="Path to the text file to compress")
    args = parser.parse_args()

    try:
        with open(args.file, "r") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    console = Console()
    console.print(f"[bold blue]Running Ablation Study on {args.file}[/bold blue] (Length: {len(content)} chars)")
    
    results = run_ablation_test(content)
    
    table = Table(title="Ablation Results")
    table.add_column("Module", justify="left", style="cyan", no_wrap=True)
    table.add_column("Original Tokens", justify="right", style="magenta")
    table.add_column("Compressed Tokens", justify="right", style="green")
    table.add_column("Tokens Saved", justify="right", style="green")
    table.add_column("Ratio", justify="right")
    table.add_column("Savings ($)", justify="right", style="yellow")
    
    for res in results:
        table.add_row(
            res["module_name"],
            str(res["original_tokens"]),
            str(res["compressed_tokens"]),
            str(res["tokens_saved"]),
            f"{res['compression_ratio']:.2f}",
            f"${res['savings_usd']:.6f}"
        )
        
    console.print(table)

if __name__ == "__main__":
    main()
