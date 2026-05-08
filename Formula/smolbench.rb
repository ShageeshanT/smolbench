# Homebrew formula for smolbench. Local tap install:
#   brew tap ShageeshanT/smolbench https://github.com/ShageeshanT/smolbench.git
#   brew install smolbench

class Smolbench < Formula
  desc "Workload-specific micro-benchmarks for LLM-powered apps"
  homepage "https://github.com/ShageeshanT/smolbench"
  url "https://github.com/ShageeshanT/smolbench/archive/refs/tags/v0.3.0.tar.gz"
  sha256 "REPLACE_WITH_RELEASE_TARBALL_SHA256"
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"smolbench").write <<~SH
      #!/bin/bash
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/cli.js" "$@"
    SH
    chmod 0755, bin/"smolbench"
  end

  test do
    assert_match "smolbench", shell_output("#{bin}/smolbench --version")
  end
end
