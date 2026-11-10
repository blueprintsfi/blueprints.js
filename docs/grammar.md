This page contains the formal definition of the string representation of tokens
in the Blueprints ecosystem. It does not define the set of on-chain actions that
can be performed on them. These are defined by the [smart contracts][core].
Instead, it defines a set of valid tokens, as well as their external token IDs
and wei amounts.

## Context-Free Grammar

For a set $A$, called an alphabet, we define $A^{*}$ as the set of finite
sequences with elements from $A$, called words. We denote the empty sequence by
$\varepsilon$. For finite sequences $w$, $v$, we define $w\ v$ as the
concatenation of these sequences.

A context-free grammar is defined by a finite set of terminal symbols $A$, a
finite set of non-terminal symbols $N$ disjoint from $A$, a goal symbol $S \in
N$, and a finite set of productions $\alpha \subseteq N \times (A \cup N)^{*}$.
A production $(X, w)$ is written as $X : w$. $X$ is called its left-hand side
and $w$ its right-hand side.

For $u, v \in (A \cup N)^{*}$, we write $u \longrightarrow v$ if $v$ can be
obtained from $u$ by replacing a single occurrence of a non-terminal $X$ with
$w$, where $X : w$ is a production. A non-terminal $X$ matches a word $w \in
A^{*}$ if there is a finite sequence $w_1, w_2, \dots, w_n $, such that $X
\longrightarrow w_1 \longrightarrow \dots \longrightarrow w_n \longrightarrow
w$. The language of the grammar is the set of words matched by $S$.

A parse tree of a word $w$ matched by $X$ is a tree whose root is labeled with
$X$, whose leaves, read from left to right, form $w$, and in which every
internal node labeled with a non-terminal $Y$ has children labeled, in order,
with the symbols of the right-hand side of some production $Y : v$. The text
matched by a node is the word formed by the leaves of its subtree. The grammar
below is unambiguous, i.e. every word matched by the goal symbol has at most one
parse tree.

In the grammar below, terminal symbols are printable ASCII characters and the
goal symbol is [*Token*](#def-token). Non-terminals are written in italics and
sequences of terminals in a monospace font, where a space denotes the character
U+0020. Productions with a common left-hand side are listed together, one per
line. The phrase **one of** means that each of the listed terminals forms a
separate production.

<div class="def" id="def-token">
    <div>
        <a href="#def-token"><em>Token</em></a> :
    </div>
    <div class="prod">
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-definition"><em>Token definition</em></a>
    </div>
</div>

<div class="def" id="def-token-amount">
    <div>
        <a href="#def-token-amount"><em>Token amount</em></a> :
    </div>
    <div class="prod">
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a>
    </div>
    <div class="prod">
        <code>~</code>
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a>
    </div>
</div>

<div class="def" id="def-amount-integer-part">
    <div>
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a> :
    </div>
    <div class="prod">
        <a href="#def-integer"><em>Integer</em></a>
    </div>
</div>

<div class="def" id="def-amount-fractional-part">
    <div>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>.</code>
        <a href="#def-integer-digit"><em>Integer digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-token-definition">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

<div class="def" id="def-token-array">
    <div>
        <a href="#def-token-array"><em>Token array</em></a> :
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-token-array-tail">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
    </div>
</div>

<div class="def" id="def-constraint-array">
    <div>
        <a href="#def-constraint-array"><em>Constraint array</em></a> :
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-constraint-array-tail">
    <div>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
    </div>
</div>

<div class="def" id="def-constraint">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
    </div>
    <div class="prod">
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

<div class="def" id="def-point-array">
    <div>
        <a href="#def-point-array"><em>Point array</em></a> :
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-point"><em>Point</em></a>
        <a href="#def-point-array-tail"><em>Point array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-point-array-tail">
    <div>
        <a href="#def-point-array-tail"><em>Point array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-point"><em>Point</em></a>
        <a href="#def-point-array-tail"><em>Point array tail</em></a>
    </div>
</div>

<div class="def" id="def-point">
    <div>
        <a href="#def-point"><em>Point</em></a> :
    </div>
    <div class="prod">
        <code>(</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>)</code>
    </div>
</div>

<div class="def" id="def-oracle">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
    </div>
    <div class="prod">
        <code>ConstantOracle&lt;</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>MultisigOracle&lt;</code>
        <a href="#def-address-array"><em>Address array</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedOracle&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

<div class="def" id="def-address-array">
    <div>
        <a href="#def-address-array"><em>Address array</em></a> :
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-address-array-tail">
    <div>
        <a href="#def-address-array-tail"><em>Address array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
    </div>
</div>

<div class="def" id="def-address">
    <div>
        <a href="#def-address"><em>Address</em></a> :
    </div>
    <div class="prod">
        Any address encoded with an
        <a href="https://eips.ethereum.org/EIPS/eip-55">EIP-55</a>
        checksum, i.e. <code>0x</code> followed by 40 hexadecimal digits whose
        letter case matches the checksum. There is a finite number of such
        words; therefore, they can be listed as a finite set of productions.
    </div>
</div>

<div class="def" id="def-integer">
    <div>
        <a href="#def-integer"><em>Integer</em></a> :
    </div>
    <div class="prod">
        <code>0</code>
    </div>
    <div class="prod">
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-integer-first-digit">
    <div>
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> : <strong>one of</strong>
    </div>
    <div class="prod">
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
    </div>
</div>

<div class="def" id="def-integer-digits">
    <div>
        <a href="#def-integer-digits"><em>Integer digits</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-integer-digit"><em>Integer digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-integer-digit">
    <div>
        <a href="#def-integer-digit"><em>Integer digit</em></a> : <strong>one of</strong>
    </div>
    <div class="prod">
        <code>0</code>
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
    </div>
</div>

<div class="def" id="def-bytes">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
    </div>
    <div class="prod">
        <a href="#def-raw-bytes"><em>Raw bytes</em></a>
    </div>
    <div class="prod">
        <a href="#def-string-bytes"><em>String bytes</em></a>
    </div>
    <div class="prod">
        <a href="#def-map-bytes"><em>Map bytes</em></a>
    </div>
    <div class="prod">
        <code>keccak256(</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>)</code>
    </div>
</div>

<div class="def" id="def-raw-bytes">
    <div>
        <a href="#def-raw-bytes"><em>Raw bytes</em></a> :
    </div>
    <div class="prod">
        <code>0x</code>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

<div class="def" id="def-hex-digit-pairs">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

<div class="def" id="def-hex-digit">
    <div>
        <a href="#def-hex-digit"><em>Hex digit</em></a> : <strong>one of</strong>
    </div>
    <div class="prod">
        <code>0</code>
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
        <code>a</code>
        <code>b</code>
        <code>c</code>
        <code>d</code>
        <code>e</code>
        <code>f</code>
    </div>
</div>

<div class="def" id="def-string-bytes">
    <div>
        <a href="#def-string-bytes"><em>String bytes</em></a> :
    </div>
    <div class="prod">
        <code>"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

<div class="def" id="def-printable-string-characters">
    <div>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-printable-string-character"><em>Printable string character</em></a>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
    </div>
</div>

<div class="def" id="def-printable-string-character">
    <div>
        <a href="#def-printable-string-character"><em>Printable string character</em></a> :
    </div>
    <div class="prod">
        Any printable ASCII character except double quote and backslash
        (U+0020–U+0021, U+0023–U+005B, or U+005D–U+007E).
    </div>
</div>

<div class="def" id="def-map-bytes">
    <div>
        <a href="#def-map-bytes"><em>Map bytes</em></a> :
    </div>
    <div class="prod">
        <code>{}</code>
    </div>
    <div class="prod">
        <code>{&nbsp;</code>
        <a href="#def-map-entry"><em>Map entry</em></a>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a>
        <code>&nbsp;}</code>
    </div>
</div>

<div class="def" id="def-map-entries-tail">
    <div>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-map-entry"><em>Map entry</em></a>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a>
    </div>
</div>

<div class="def" id="def-map-entry">
    <div>
        <a href="#def-map-entry"><em>Map entry</em></a> :
    </div>
    <div class="prod">
        <code>"</code>
        <a href="#def-map-key"><em>Map key</em></a>
        <code>":&nbsp;"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

<div class="def" id="def-map-key">
    <div>
        <a href="#def-map-key"><em>Map key</em></a> :
    </div>
    <div class="prod">
        <a href="#def-printable-string-character"><em>Printable string character</em></a>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
    </div>
</div>

## Abstract Operations

Abstract operations are algorithms that operate on mathematical values rather
than on nodes of a parse tree. Byte sequences are compared lexicographically.

### keccak256(<var>arg</var>)

The abstract operation keccak256 takes a byte sequence <var>arg</var> and
returns its keccak256 digest as a sequence of 32 bytes.

### AddressToBytes(<var>address</var>)

The abstract operation AddressToBytes takes an address <var>address</var>, and
returns it encoded as a sequence of 20 bytes in big-endian order.

### UintToBytes(<var>n</var>)

The abstract operation UintToBytes takes a 256-bit unsigned integer <var>n</var>
and returns it encoded as a sequence of 32 bytes in big-endian order.

### IntToBytes(<var>n</var>)

The abstract operation IntToBytes takes a 256-bit signed integer <var>n</var>
and returns it encoded as a sequence of 32 bytes in big-endian order using two's
complement encoding.

### EncodeWeiAmount(<var>weiAmount</var>, <var>weiPerUnit</var>)

The abstract operation EncodeWeiAmount takes a non-negative integer
<var>weiAmount</var> and a positive rational number <var>weiPerUnit</var>, and
returns the canonical string representation of the amount of tokens worth
<var>weiAmount</var> wei.

1. Let <var>amount</var> be $\frac{\text{\htmlClass{var}{weiAmount}}}
   {\text{\htmlClass{var}{weiPerUnit}}}$.
1. If <var>amount</var> is an integer, return its base-10 representation.
1. Let <var>decimals</var> be $2 + e$, where $e$ is the smallest non-negative
   integer such that $10^{e} \geq \text{\htmlClass{var}{weiPerUnit}}$.
1. Let <var>scaled</var> be $\left\lfloor \text{\htmlClass{var}{amount}} \cdot
   10^{\text{\htmlClass{var}{decimals}}} + \frac{1}{2} \right\rfloor$.
1. Let <var>integerPart</var> be the base-10 representation of $\left\lfloor
   \frac{\text{\htmlClass{var}{scaled}}}{10^{\text{\htmlClass{var}{decimals}}}}
   \right\rfloor$.
1. Let <var>fractionalPart</var> be the base-10 representation of
   $\text{\htmlClass{var}{scaled}} \bmod 10^{\text{\htmlClass{var}{decimals}}}$,
   padded with leading zeros to the length of <var>decimals</var>.
1. If <var>scaled</var> equals $\text{\htmlClass{var}{amount}} \cdot
   10^{\text{\htmlClass{var}{decimals}}}$:

   1. Remove all trailing zeros from <var>fractionalPart</var>.
   1. Return the concatenation of <var>integerPart</var>, `.`, and
      <var>fractionalPart</var>.

1. Return the concatenation of `~`, <var>integerPart</var>, `.`, and
   <var>fractionalPart</var>.

## Syntax-Directed Operations

A syntax-directed operation is a named operation defined on nodes of a parse
tree. For each production, it specifies an algorithm that is run for nodes
derived using that production. Within such an algorithm, “Op of
*Nonterminal*” means running the operation Op on the child node corresponding
to *Nonterminal* in the right-hand side of the production, and “this
*Nonterminal*” means the node itself. When the right-hand side contains a
non-terminal more than once, the occurrences are referred to as the first,
second, etc.

### WeiAmount

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-definition"><em>Token definition</em></a>
    </div>
</div>

1. Let <var>amountStr</var> be the text matched by [*Token
   amount*](#def-token-amount).
1. If <var>amountStr</var> starts with `~`, remove that prefix.
1. Let <var>amount</var> be <var>amountStr</var> interpreted as a rational
   number written in base-10 with `.` as the separator between the integer and
   fractional parts.
1. Let <var>weiPerUnit</var> be [WeiPerUnit](#weiperunit) of [*Token
   definition*](#def-token-definition).
1. Return $\left\lfloor \text{\htmlClass{var}{amount}} \cdot
   \text{\htmlClass{var}{weiPerUnit}} + \frac{1}{2} \right\rfloor$.

### WeiPerUnit

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>decimals</var> be [IntegerValue](#integervalue) of
   [*Integer*](#def-integer).
1. Return $10^{\text{\htmlClass{var}{decimals}}}$.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>map</var> be [TokenMap](#tokenmap) of [*Token
   array*](#def-token-array).
1. Return the greatest common divisor of the values of all entries of
   <var>map</var>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>result</var> be [WeiAmount](#weiamount) of [*Token*](#def-token).
1. For each <var>constraint</var> of [Constraints](#constraints) of
   [*Constraint array*](#def-constraint-array):

   1. Let <var>scale</var> be [Scale](#scale) of <var>constraint</var>.
   1. Set <var>result</var> to $\frac{\text{\htmlClass{var}{result}}}
      {\text{\htmlClass{var}{scale}}}$.

1. Return <var>result</var>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [WeiAmount](#weiamount) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return $1$.

### ExternalTokenId

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-definition"><em>Token definition</em></a>
    </div>
</div>

1. Return [ExternalTokenId](#externaltokenid) of [*Token
   definition*](#def-token-definition).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>address</var> be [BlueprintAddress](#blueprintaddress) of this
   [*Token definition*](#def-token-definition).
1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytesaddress)(<var>address</var>).
1. Let <var>internalTokenId</var> be [InternalTokenId](#internaltokenid) of this
   [*Token definition*](#def-token-definition).
1. Let <var>toHash</var> be the concatenation of <var>addressBytes</var> and
   <var>internalTokenId</var>.
1. Return [keccak256](#keccak256arg)(<var>toHash</var>).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [ExternalTokenId](#externaltokenid) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Bytes*](#def-bytes).

### BlueprintAddress

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x98198D50bA4e2ac6624f3659F8e404A3aFE30e71</code>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x563433a6cCBB6c3a8DbC4fb5c4FF56602af25779</code>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0xb97dc662E26EE24e6C736E244d57d53610CB236c</code>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x5F29d59D04585eb7CF38B056474EBfC1d9CF444C</code>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the text matched by [*Address*](#def-address).

### InternalTokenId

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return a sequence of 32 zero bytes.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>zeros</var> be a sequence of 12 zero bytes.
1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytesaddress)(the text matched by
   [*Address*](#def-address)).
1. Return the concatenation of <var>zeros</var> and <var>addressBytes</var>.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>map</var> be [TokenMap](#tokenmap) of [*Token
   array*](#def-token-array).
1. Let <var>gcd</var> be [WeiPerUnit](#weiperunit) of this [*Token
   definition*](#def-token-definition).
1. Let <var>ids</var> be the empty sequence.
1. Let <var>amounts</var> be the empty sequence.
1. For each entry <var>entry</var> of <var>map</var>, in ascending order of
   keys:

   1. Append the key of <var>entry</var> to <var>ids</var>.
   1. Let <var>normalizedAmount</var> be $\frac{\text{\htmlClass{var}
      {value}}}{\text{\htmlClass{var}{gcd}}}$, where <var>value</var> is the
      value of <var>entry</var>.
   1. Append [UintToBytes](#uinttobytesn)(<var>normalizedAmount</var>) to
      <var>amounts</var>.

1. Return [keccak256](#keccak256arg)(the concatenation of <var>ids</var>
   and <var>amounts</var>).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>constraints</var> be [Constraints](#constraints) of [*Constraint
   array*](#def-constraint-array).
1. Let <var>buffer</var> be the concatenation of
   [UintToBytes](#uinttobytesn)($64$),
   [ExternalTokenId](#externaltokenid) of [*Token*](#def-token), and
   [UintToBytes](#uinttobytesn)(the number of elements of
   <var>constraints</var>).
1. For each <var>constraint</var> of <var>constraints</var>, in ascending order
   of [FeedId](#feedid) of <var>constraint</var>:

   1. Append [FeedId](#feedid) of <var>constraint</var> to <var>buffer</var>.
   1. Append [PayoffHash](#payoffhash) of <var>constraint</var> to
      <var>buffer</var>.

1. Return [keccak256](#keccak256arg)(<var>buffer</var>).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Bytes*](#def-bytes).

### TokenMap

TokenMap returns a map from external token ids to the sums of wei amounts of
the tokens with these ids.

<div class="def">
    <div>
        <a href="#def-token-array"><em>Token array</em></a> :
        <code>[</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
    </div>
</div>

1. Let <var>externalTokenId</var> be [ExternalTokenId](#externaltokenid) of
   [*Token*](#def-token).
1. Let <var>weiAmount</var> be [WeiAmount](#weiamount) of
   [*Token*](#def-token).
1. Let <var>map</var> be [TokenMap](#tokenmap) of [*Token array
   tail*](#def-token-array-tail).
1. If <var>map</var> has an entry with key <var>externalTokenId</var>, add
   <var>weiAmount</var> to the value of that entry.
1. Otherwise, insert a new entry into <var>map</var> with key
   <var>externalTokenId</var> and value <var>weiAmount</var>.
1. Return <var>map</var>.

<div class="def">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty map.

### Constraints

<div class="def">
    <div>
        <a href="#def-constraint-array"><em>Constraint array</em></a> :
        <code>[</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
    </div>
</div>

1. Let <var>rest</var> be [Constraints](#constraints) of [*Constraint array
   tail*](#def-constraint-array-tail).
1. Return the list whose first element is the [*Constraint*](#def-constraint)
   node, followed by the elements of <var>rest</var>.

<div class="def">
    <div>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty list.

### Points

<div class="def">
    <div>
        <a href="#def-point-array"><em>Point array</em></a> :
        <code>[</code>
        <a href="#def-point"><em>Point</em></a>
        <a href="#def-point-array-tail"><em>Point array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-point-array-tail"><em>Point array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-point"><em>Point</em></a>
        <a href="#def-point-array-tail"><em>Point array tail</em></a>
    </div>
</div>

1. Let <var>x</var> be [IntegerValue](#integervalue) of the first
   [*Integer*](#def-integer) of [*Point*](#def-point).
1. Let <var>y</var> be [IntegerValue](#integervalue) of the second
   [*Integer*](#def-integer) of [*Point*](#def-point).
1. Let <var>rest</var> be [Points](#points) of [*Point array
   tail*](#def-point-array-tail).
1. Return the list whose first element is the pair (<var>x</var>,
   <var>y</var>), followed by the elements of <var>rest</var>.

<div class="def">
    <div>
        <a href="#def-point-array-tail"><em>Point array tail</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty list.

### Slopes

<div class="def">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

1. Let $(x_0, y_0), \dots, (x_k, y_k)$ be the elements of [Points](#points) of
   [*Point array*](#def-point-array).
1. Return the list $s_1, \dots, s_k$, where $s_i = \frac{y_i - y_{i - 1}}{x_i -
   x_{i - 1}}$.

### Scale

<div class="def">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

1. Let $(x_0, y_0), \dots, (x_k, y_k)$ be the elements of [Points](#points) of
   [*Point array*](#def-point-array).
1. Let $s_1, \dots, s_k$ be the elements of [Slopes](#slopes) of this
   [*Constraint*](#def-constraint).
1. Return the smallest positive rational number $c$ such that $c \cdot y_0$ and
   $c \cdot s_i$ for each $i$ are integers.

### PayoffHash

<div class="def">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

1. Let $(x_0, y_0), \dots, (x_k, y_k)$ be the elements of [Points](#points) of
   [*Point array*](#def-point-array).
1. Let $s_1, \dots, s_k$ be the elements of [Slopes](#slopes) of this
   [*Constraint*](#def-constraint).
1. Let $c$ be [Scale](#scale) of this [*Constraint*](#def-constraint).
1. Let <var>buffer</var> be the concatenation of
   [UintToBytes](#uinttobytesn)($32$),
   [UintToBytes](#uinttobytesn)($c \cdot y_0$),
   [UintToBytes](#uinttobytesn)($64$), and
   [UintToBytes](#uinttobytesn)($k$).
1. For each $i$ from $1$ to $k$:

   1. Append [IntToBytes](#inttobytesn)($c \cdot s_i$) to <var>buffer</var>.
   1. Append [UintToBytes](#uinttobytesn)($x_i - x_{i - 1}$) to
      <var>buffer</var>.

1. Return [keccak256](#keccak256arg)(<var>buffer</var>).

### FeedId

<div class="def">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytesaddress)([OracleAddress](#oracleaddress) of
   [*Oracle*](#def-oracle)).
1. Let <var>toHash</var> be the concatenation of <var>addressBytes</var> and
   [FeedId](#feedid) of [*Oracle*](#def-oracle).
1. Return [keccak256](#keccak256arg)(<var>toHash</var>).

Note that this is equal to the feed id of the oracle wrapped in a
`ConstantOracle`.

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>ConstantOracle&lt;</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytesaddress)([OracleAddress](#oracleaddress) of
   the inner [*Oracle*](#def-oracle)).
1. Let <var>toHash</var> be the concatenation of <var>addressBytes</var> and
   [FeedId](#feedid) of the inner [*Oracle*](#def-oracle).
1. Return [keccak256](#keccak256arg)(<var>toHash</var>).

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>MultisigOracle&lt;</code>
        <a href="#def-address-array"><em>Address array</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>threshold</var> be [IntegerValue](#integervalue) of
   [*Integer*](#def-integer).
1. Let <var>multisig</var> be
   [UintToBytes](#uinttobytesn)(<var>threshold</var>).
1. For each <var>address</var> of [Addresses](#addresses) of [*Address
   array*](#def-address-array):

   1. Append a sequence of 12 zero bytes to <var>multisig</var>.
   1. Append [AddressToBytes](#addresstobytesaddress)(<var>address</var>) to
      <var>multisig</var>.

1. Let <var>toHash</var> be the concatenation of
   [keccak256](#keccak256arg)(<var>multisig</var>) and [Bytes](#bytes) of
   [*Bytes*](#def-bytes).
1. Return [keccak256](#keccak256arg)(<var>toHash</var>).

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>UnsupportedOracle&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Bytes*](#def-bytes).

### OracleAddress

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>ConstantOracle&lt;</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x864ed9f1D46386127323ab4Bb0645aF1eC65EA35</code>.

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>MultisigOracle&lt;</code>
        <a href="#def-address-array"><em>Address array</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x9aDCaB3f6904d36E179F0861d0BACBeaE97D87BD</code>.

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>UnsupportedOracle&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the text matched by [*Address*](#def-address).

### Addresses

<div class="def">
    <div>
        <a href="#def-address-array"><em>Address array</em></a> :
        <code>[</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-address-array-tail"><em>Address array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
    </div>
</div>

1. Let <var>rest</var> be [Addresses](#addresses) of [*Address array
   tail*](#def-address-array-tail).
1. Return the list whose first element is the text matched by
   [*Address*](#def-address), followed by the elements of <var>rest</var>.

<div class="def">
    <div>
        <a href="#def-address-array-tail"><em>Address array tail</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty list.

### IntegerValue

<div class="def">
    <div>
        <a href="#def-integer"><em>Integer</em></a> :
    </div>
    <div class="prod">
        <code>0</code>
    </div>
    <div class="prod">
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

1. Return the integer whose base-10 representation is equal to the text matched
   by this [*Integer*](#def-integer).

### Bytes

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-raw-bytes"><em>Raw bytes</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Raw bytes*](#def-raw-bytes).

<div class="def">
    <div>
        <a href="#def-raw-bytes"><em>Raw bytes</em></a> :
        <code>0x</code>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Hex digit pairs*](#def-hex-digit-pairs).

<div class="def">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty sequence.

<div class="def">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

1. Let <var>x</var> be the integer whose hexadecimal representation is equal to
   the text matched by the first [*Hex digit*](#def-hex-digit).
1. Let <var>y</var> be the integer whose hexadecimal representation is equal to
   the text matched by the second [*Hex digit*](#def-hex-digit).
1. Let <var>byte</var> be $16 \cdot \text{\htmlClass{var}{x}} +
   \text{\htmlClass{var}{y}}$.
1. Let <var>suffix</var> be [Bytes](#bytes) of the inner [*Hex digit
   pairs*](#def-hex-digit-pairs).
1. Return the sequence whose first element is <var>byte</var>, followed by the
   elements of <var>suffix</var>.

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-string-bytes"><em>String bytes</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*String bytes*](#def-string-bytes).

<div class="def">
    <div>
        <a href="#def-string-bytes"><em>String bytes</em></a> :
        <code>"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

1. Return the sequence of ASCII codes of the characters of the text matched by
   [*Printable string characters*](#def-printable-string-characters).

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-map-bytes"><em>Map bytes</em></a>
    </div>
</div>

1. Return the sequence of ASCII codes of the characters of the text matched by
   [*Map bytes*](#def-map-bytes).

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <code>keccak256(</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>)</code>
    </div>
</div>

1. Return [keccak256](#keccak256arg)([Bytes](#bytes) of the inner
   [*Bytes*](#def-bytes)).

## Additional Errors

Not every word matched by [*Token*](#def-token) is a valid token. A word is a
valid token if and only if it is matched by [*Token*](#def-token) and none of
the rules below applies to any node of its parse tree.

The rules of a node are only checked if no rule applies to any of its
descendants, and the rules for a single production are checked in the listed
order. Therefore, a rule may assume that the preceding rules and the rules of
the descendants do not apply. In particular, all syntax-directed operations it
uses are well defined.

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-definition"><em>Token definition</em></a>
    </div>
</div>

1. It is an error if [WeiAmount](#weiamount) of this [*Token*](#def-token) is
   greater than or equal to $2^{256}$.
1. It is an error if
   [EncodeWeiAmount](#encodeweiamountweiamount-weiperunit)([WeiAmount](#weiamount)
   of this [*Token*](#def-token), [WeiPerUnit](#weiperunit) of [*Token
   definition*](#def-token-definition)) is not equal to the text matched by
   [*Token amount*](#def-token-amount).

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if [IntegerValue](#integervalue) of
   [*Integer*](#def-integer) is greater than $77$.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-token-array"><em>Token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if [TokenMap](#tokenmap) of [*Token
   array*](#def-token-array) has an entry whose value divided by
   [WeiPerUnit](#weiperunit) of this [*Token
   definition*](#def-token-definition) is greater than or equal to
   $2^{256}$.

<div class="def">
    <div>
        <a href="#def-token-array"><em>Token array</em></a> :
        <code>[</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
    </div>
</div>

1. It is an error if [WeiAmount](#weiamount) of [*Token*](#def-token) is $0$.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
        <code>Prediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if [WeiAmount](#weiamount) of [*Token*](#def-token) is $0$.
1. It is an error if two distinct elements of [Constraints](#constraints) of
   [*Constraint array*](#def-constraint-array) have equal [FeedId](#feedid).

<div class="def">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-point-array"><em>Point array</em></a>
        <code>)</code>
    </div>
</div>

Let $(x_0, y_0), \dots, (x_k, y_k)$ be the elements of [Points](#points) of
[*Point array*](#def-point-array).

1. It is an error if $k = 0$.
1. It is an error if $x_0 \neq 0$.
1. It is an error if $x_i \geq 2^{256}$ or $y_i \geq 2^{256}$ for some $i$.
1. It is an error if $x_i \leq x_{i - 1}$ for some $i \geq 1$.
1. It is an error if $s_i = s_{i - 1}$ for some $i \geq 2$, where $s_1, \dots,
   s_k$ are the elements of [Slopes](#slopes) of this
   [*Constraint*](#def-constraint).
1. It is an error if $s_k = 0$.
1. It is an error if $c \cdot y_i \geq 2^{256}$ for some $i$, where $c$ is
   [Scale](#scale) of this [*Constraint*](#def-constraint).
1. It is an error if $c \cdot s_i < -2^{255}$ or $c \cdot s_i \geq 2^{255}$ for
   some $i$.

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>MultisigOracle&lt;</code>
        <a href="#def-address-array"><em>Address array</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if [IntegerValue](#integervalue) of [*Integer*](#def-integer)
   is $0$ or is greater than the number of elements of
   [Addresses](#addresses) of [*Address array*](#def-address-array).
1. It is an error if the length of [Bytes](#bytes) of [*Bytes*](#def-bytes) is
   not $32$.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if [WeiAmount](#weiamount) of [*Token*](#def-token) is $0$.

<div class="def">
    <div>
        <a href="#def-token-definition"><em>Token definition</em></a> :
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
        <code>UnsupportedOracle&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. It is an error if the length of [Bytes](#bytes) of [*Bytes*](#def-bytes) is
   not $32$.

<div class="def">
    <div>
        <a href="#def-map-bytes"><em>Map bytes</em></a> :
        <code>{&nbsp;</code>
        <a href="#def-map-entry"><em>Map entry</em></a>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a>
        <code>&nbsp;}</code>
    </div>
</div>

1. It is an error if two distinct [*Map entry*](#def-map-entry) nodes in the
   subtree of this [*Map bytes*](#def-map-bytes) node match the same text for
   [*Map key*](#def-map-key).

[core]: https://github.com/blueprintsfi/core
