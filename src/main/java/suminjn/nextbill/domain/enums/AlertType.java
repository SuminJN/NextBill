package suminjn.nextbill.domain.enums;

public enum AlertType {
    D_7("D-7"),
    D_3("D-3"),
    D_1("D-1"),
    D_DAY("D-Day");

    private final String displayName;

    AlertType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}