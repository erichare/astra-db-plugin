// Syntax-only check for Java snippets: parse each file with javac's tree API
// (no classpath, no symbol resolution) and report parse errors.
//
//   java scripts/checks/ParseJava.java <file.java>...
import com.sun.source.util.JavacTask;
import java.io.File;
import java.util.List;
import java.util.stream.Stream;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

public class ParseJava {
  public static void main(String[] args) throws Exception {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
    try (StandardJavaFileManager files = compiler.getStandardFileManager(diagnostics, null, null)) {
      Iterable<? extends JavaFileObject> units =
          files.getJavaFileObjectsFromFiles(Stream.of(args).map(File::new).toList());
      JavacTask task = (JavacTask) compiler.getTask(null, files, diagnostics, List.of("-proc:none"), null, units);
      task.parse();
    }
    int errors = 0;
    for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
      if (d.getKind() != Diagnostic.Kind.ERROR) continue;
      errors++;
      System.err.println(d.getSource().getName() + ":" + d.getLineNumber() + ": " + d.getMessage(null));
    }
    System.out.println("parsed " + args.length + " Java snippets, " + errors + " error(s)");
    System.exit(errors > 0 ? 1 : 0);
  }
}
