if(item instanceof AddCard){
    return "addCardView";
}
if(item instanceof ProfileSummaryCard){
    return "profileSummaryCardView";
}
if(item instanceof SortCard){
    return "sortCardView";
}
if(item instanceof HistoryNavigationCard){
    return "navCardView";
}
return namedView